/**
 * Nesting Optimization — Fixed-Point Scoring Kernel
 *
 * The accelerator only *proposes* an ordering: it converts the same normalized weights and layout
 * metrics used by the CPU into stable fixed-point integers and returns candidate indices in a
 * deterministic order. Selection, tie-breaking and validation stay on the CPU baseline
 * (Constitution IV, FR-001/FR-003).
 *
 * @module nesting/optimization/webgpu/score
 */

import type { OptimizationObjective } from '../../types'
import { scoreLayout, type LayoutMetrics } from '../objective'
import {
  GPU_BUFFER_USAGE,
  GPU_MAP_MODE_READ,
  type GpuComputeDeviceLike,
} from './device'

/** Fixed-point scale: weights and metrics are ~0–100, so scores stay exact integers here. */
export const FIXED_POINT_SCALE = 1_000_000

/** Scores one candidate as a stable integer for hardware and software parity. */
export function fixedPointScore(
  metrics: LayoutMetrics,
  weights: OptimizationObjective,
): number {
  return Math.round(scoreLayout(metrics, weights) * FIXED_POINT_SCALE)
}

/** One indexed candidate proposal. */
export interface CandidateProposal {
  index: number
  score: number
}

const SCORE_SHADER = `
@group(0) @binding(0) var<storage, read> metrics: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> weights: vec4<f32>;
@group(0) @binding(2) var<storage, read_write> scores: array<u32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let index = id.x;
  if (index >= arrayLength(&metrics)) {
    return;
  }
  let metric = metrics[index];
  let score = dot(metric, weights);
  scores[index] = u32(round(score * 1000000.0));
}
`

/**
 * Ranks candidates best-first with a total order: descending score, then ascending index. The
 * index tie-break makes the proposal deterministic regardless of the underlying executor.
 */
export function proposeOrder(
  candidates: readonly LayoutMetrics[],
  weights: OptimizationObjective,
): CandidateProposal[] {
  return candidates
    .map((metrics, index) => ({
      index,
      score: fixedPointScore(metrics, weights),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
}

/**
 * Creates an async scorer backed by a WebGPU compute dispatch.
 *
 * @param device - A validated compute-capable WebGPU device
 * @param weights - Normalized objective weights
 * @returns Scorer that resolves fixed-point scores converted to CPU score units
 */
export function createGpuScorer(
  device: GpuComputeDeviceLike,
  weights: OptimizationObjective,
): {
  score(metrics: readonly LayoutMetrics[]): Promise<number[]>
} {
  return {
    score: (metrics) => dispatchGpuScores(device, metrics, weights),
  }
}

/**
 * Dispatches fixed-point candidate scoring to WebGPU and reads the results back.
 *
 * @param device - A validated compute-capable WebGPU device
 * @param metrics - Candidate metrics in stable enumeration order
 * @param weights - Normalized objective weights
 * @returns Scores in the same units used by the CPU scorer
 * @throws {Error} When the device cannot complete the compute dispatch
 */
export async function dispatchGpuScores(
  device: GpuComputeDeviceLike,
  metrics: readonly LayoutMetrics[],
  weights: OptimizationObjective,
): Promise<number[]> {
  if (metrics.length === 0) return []

  const metricsData = new Float32Array(
    metrics.flatMap((metric) => [
      metric.materialUse,
      metric.travel,
      metric.sheetCount,
      metric.remnant,
    ]),
  )
  const weightsData = new Float32Array([
    weights.materialUse,
    weights.travel,
    weights.sheetCount,
    weights.remnant,
  ])
  const byteLength = metrics.length * Uint32Array.BYTES_PER_ELEMENT
  const metricsBuffer = device.createBuffer({
    size: metricsData.byteLength,
    usage: GPU_BUFFER_USAGE.STORAGE | GPU_BUFFER_USAGE.COPY_DST,
  })
  const weightsBuffer = device.createBuffer({
    size: weightsData.byteLength,
    usage: GPU_BUFFER_USAGE.STORAGE | GPU_BUFFER_USAGE.COPY_DST,
  })
  const scoresBuffer = device.createBuffer({
    size: byteLength,
    usage: GPU_BUFFER_USAGE.STORAGE | GPU_BUFFER_USAGE.COPY_SRC,
  })
  const readbackBuffer = device.createBuffer({
    size: byteLength,
    usage: GPU_BUFFER_USAGE.MAP_READ | GPU_BUFFER_USAGE.COPY_DST,
  })

  try {
    device.queue.writeBuffer(metricsBuffer, 0, metricsData.buffer)
    device.queue.writeBuffer(weightsBuffer, 0, weightsData.buffer)

    const module = device.createShaderModule({ code: SCORE_SHADER })
    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module, entryPoint: 'main' },
    })
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: metricsBuffer } },
        { binding: 1, resource: { buffer: weightsBuffer } },
        { binding: 2, resource: { buffer: scoresBuffer } },
      ],
    })
    const encoder = device.createCommandEncoder()
    const pass = encoder.beginComputePass()
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.dispatchWorkgroups(Math.ceil(metrics.length / 64))
    pass.end()
    encoder.copyBufferToBuffer(scoresBuffer, 0, readbackBuffer, 0, byteLength)
    device.queue.submit([encoder.finish()])

    await readbackBuffer.mapAsync(GPU_MAP_MODE_READ)
    const mapped = new Uint32Array(readbackBuffer.getMappedRange().slice(0))
    readbackBuffer.unmap()
    return [...mapped].map((score) => score / FIXED_POINT_SCALE)
  } finally {
    metricsBuffer.destroy()
    weightsBuffer.destroy()
    scoresBuffer.destroy()
    readbackBuffer.destroy()
  }
}
