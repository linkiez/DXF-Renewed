import { expect } from 'expect'
import {
  dispatchGpuScores,
  FIXED_POINT_SCALE,
  searchBestArrangementAsync,
} from '../../../../src/nesting'
import type {
  GpuBindGroupLike,
  GpuBindGroupLayoutLike,
  GpuCommandEncoderLike,
  GpuComputeDeviceLike,
  GpuComputePassLike,
  GpuComputePipelineLike,
  GpuBufferLike,
} from '../../../../src/nesting/optimization/webgpu/device'
import { shapeFrom } from '../../../resources/nest-fixtures/trueShapeBenchmark'

class FakeBuffer implements GpuBufferLike {
  readonly data: Uint8Array

  constructor(size: number) {
    this.data = new Uint8Array(size)
  }

  destroy(): void {}

  async mapAsync(): Promise<void> {}

  getMappedRange(): ArrayBuffer {
    return this.data.buffer
  }

  unmap(): void {}
}

class FakeDevice implements GpuComputeDeviceLike {
  readonly buffers: FakeBuffer[] = []
  readonly queue = {
    writeBuffer: (buffer: GpuBufferLike, offset: number, data: ArrayBuffer) => {
      const target = buffer as FakeBuffer
      target.data.set(new Uint8Array(data), offset)
    },
    submit: (commands: object[]) => {
      for (const command of commands as Array<{
        bindGroup: { entries: Array<{ binding: number; resource: { buffer: FakeBuffer } }> }
        copy: { source: FakeBuffer; destination: FakeBuffer; size: number }
      }>) {
        const metricBuffer = command.bindGroup.entries[0].resource.buffer
        const weightBuffer = command.bindGroup.entries[1].resource.buffer
        const scoreBuffer = command.bindGroup.entries[2].resource.buffer
        const metrics = new Float32Array(
          metricBuffer.data.buffer,
          metricBuffer.data.byteOffset,
          metricBuffer.data.byteLength / Float32Array.BYTES_PER_ELEMENT,
        )
        const weights = new Float32Array(
          weightBuffer.data.buffer,
          weightBuffer.data.byteOffset,
          weightBuffer.data.byteLength / Float32Array.BYTES_PER_ELEMENT,
        )
        const scores = new Uint32Array(scoreBuffer.data.buffer)
        scores[0] =
          Math.round(
            metrics[0] * weights[0] +
              metrics[1] * weights[1] +
              metrics[2] * weights[2] +
              metrics[3] * weights[3],
          ) * FIXED_POINT_SCALE
        command.copy.destination.data.set(
          scoreBuffer.data.subarray(0, command.copy.size),
        )
      }
    },
  }

  createShaderModule(): object {
    return {}
  }

  createComputePipeline(): GpuComputePipelineLike {
    return {
      getBindGroupLayout: (): GpuBindGroupLayoutLike => ({}),
    }
  }

  createBuffer(descriptor: { size: number }): GpuBufferLike {
    const buffer = new FakeBuffer(descriptor.size)
    this.buffers.push(buffer)
    return buffer
  }

  createBindGroup(descriptor: {
    entries: Array<{ binding: number; resource: { buffer: GpuBufferLike } }>
  }): GpuBindGroupLike {
    return descriptor as GpuBindGroupLike
  }

  createCommandEncoder(): GpuCommandEncoderLike {
    let bindGroup: {
      entries: Array<{ binding: number; resource: { buffer: FakeBuffer } }>
    } | undefined
    let copy:
      | { source: FakeBuffer; destination: FakeBuffer; size: number }
      | undefined
    const pass: GpuComputePassLike = {
      setPipeline: (): void => {},
      setBindGroup: (_index, value): void => {
        bindGroup = value as typeof bindGroup
      },
      dispatchWorkgroups: (): void => {},
      end: (): void => {},
    }
    return {
      beginComputePass: () => pass,
      copyBufferToBuffer: (
        source,
        _sourceOffset,
        destination,
        _destinationOffset,
        size,
      ) => {
        copy = {
          source: source as FakeBuffer,
          destination: destination as FakeBuffer,
          size,
        }
      },
      finish: () => ({ bindGroup, copy }),
    }
  }

  destroy(): void {}
}

describe('optimization/webgpu/score', () => {
  it('dispatches fixed-point candidate scores through a compute device', async () => {
    const device = new FakeDevice()
    const scores = await dispatchGpuScores(
      device,
      [{ materialUse: 10, travel: 20, sheetCount: 30, remnant: 40 }],
      { materialUse: 0.25, travel: 0.25, sheetCount: 0.25, remnant: 0.25 },
    )

    expect(scores).toEqual([25])
  })

  it('rejects invalid scorer output instead of selecting a fallback candidate', async () => {
    const shape = shapeFrom('invalid-score', [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 },
    ])

    await expect(
      searchBestArrangementAsync(
        [{ request: { shape, quantity: 1 }, rotations: [0] }],
        [{ id: 'sheet', kind: 'sheet', width: 100, height: 100 }],
        0,
        0,
        100,
        ['area-desc'],
        { materialUse: 1, travel: 0, sheetCount: 0, remnant: 0 },
        { score: async () => [Number.NaN] },
      ),
    ).rejects.toThrow('invalid candidate scores')
  })
})
