import type { PostProcessor, PostProcessorSummary } from './types'

const processors = new Map<string, PostProcessor>()
const key = (id: string, revision: string): string => `${id}@${revision}`

/**
 * Register an exact versioned processor.
 *
 * @param processor - Processor implementation to register.
 * @throws {Error} If the processor identity is already registered.
 */
export function registerPostProcessor(processor: PostProcessor): void {
  const processorKey = key(processor.id, processor.revision)
  if (processors.has(processorKey)) throw new Error(`Post-processor already registered: ${processorKey}`)
  processors.set(processorKey, processor)
}

/** List registered processor revisions in deterministic order. */
export function listPostProcessors(): readonly PostProcessorSummary[] {
  return [...processors.values()]
    .sort((left, right) => key(left.id, left.revision).localeCompare(key(right.id, right.revision)))
    .map(({ id, name, revision, machineKind }) => ({ id, name, revision, machineKind }))
}

/**
 * Resolve an exact processor identity.
 *
 * @param id - Processor identifier.
 * @param revision - Exact processor revision.
 * @returns The registered processor, or undefined when no exact match exists.
 */
export function resolvePostProcessor(id: string, revision: string): PostProcessor | undefined {
  return processors.get(key(id, revision))
}
