/**
 * Public contract: Observable nesting surface (feature 009-async-nesting-flows).
 *
 * This file is a contract, not an implementation. It freezes the exported signatures the
 * eight in-scope nesting flows MUST have after the feature ships, so tests, `*.doc.md`
 * updates and the 7.7.6 -> 8.0.0 migration agree on one surface.
 *
 * Normative rules (spec.md FR-001..FR-011):
 *  - Every in-scope flow returns `Observable<T>`, emits exactly one value, then `complete`s (FR-001).
 *  - Lazy: no pipeline work before `subscribe` (FR-001, SC-007).
 *  - Cold per subscription: each `subscribe` re-runs independently, no cache/multicast (FR-011, SC-008).
 *  - `unsubscribe` is a silent teardown: no `next`, `complete` or `error` (FR-007, SC-006).
 *  - Expected outcomes (unplaceable items, fallback) are emissions, never errors (FR-004, FR-008).
 *  - `error` is reserved for programmer/contract violations (FR-009).
 */

import type { Observable } from 'rxjs'
import type { ParsedDXF } from '../../../src/types'
import type {
  NestingOptions,
  NestingResult,
  NestRequest,
  NestResponse,
} from '../../../src/nesting/types'
import type { NestOptions, NestResult, NEST_PRESETS } from '../../../src/nest/types'
import type { ExtractPartsOptions } from '../../../src/nest/extractParts'
import type { PrepareOptions, PrepareResult } from '../../../src/nesting/pro/types'

/** Output of the part-based pipeline today (`nestDXF`/`nestWithPreset`/`quickNest`). */
export type NestDxfResult = NestResult & {
  svg: () => string
  dxf: () => string
  metricsSummary: () => string
}

// src/nesting/applyNesting.ts
/** Single-emission Observable of a bin-packing run over parsed DXF entities. */
export declare function nest(
  parsed: ParsedDXF,
  partialOptions?: Partial<NestingOptions>,
): Observable<NestingResult>

/** Single-emission Observable of a run over raw DXF text. */
export declare function nestFromDxf(
  dxfString: string,
  partialOptions?: Partial<NestingOptions>,
): Observable<NestingResult>

// src/nest/index.ts
/** Single-emission Observable of the part-based nesting pipeline. */
export declare function nestDXF(
  dxfText: string,
  options: Partial<NestOptions> & { autoDetectBin?: boolean },
  extractOptions?: Partial<ExtractPartsOptions>,
): Observable<NestDxfResult>

/** Single-emission Observable of `nestDXF` under a named preset. */
export declare function nestWithPreset(
  dxfText: string,
  preset: keyof typeof NEST_PRESETS,
  binSize: { width: number; height: number },
): Observable<NestDxfResult>

/** Single-emission Observable of the zero-configuration laser run. */
export declare function quickNest(dxfText: string): Observable<NestDxfResult>

// src/nesting/NestingHelper.ts
/** `NestingHelper.nest` is cold per call; synchronous accessors keep their contract. */
export interface NestingHelperContract {
  nest(partialOptions?: Partial<NestingOptions>): Observable<NestingResult>
  readonly nestingResult: NestingResult
  readonly shapes: unknown[]
  toNestedSvg(options?: unknown): string
  toNestedDxf(): string
}

// src/nesting/trueShape/index.ts
/** Single-emission Observable of the true-shape search. */
export declare function nestTrueShape(request: NestRequest): Observable<NestResponse>

// src/nesting/pro/partPrep/index.ts
/** Single-emission Observable of part preparation. */
export declare function prepareParts(
  dxf: string | { entities: unknown[] },
  options: PrepareOptions,
): Observable<PrepareResult>

// Out of scope — MUST stay synchronous: toNestedSvg, toNestedDxf, extractShapes, sortShapes,
// packMultiSheet, searchBestArrangement, analyzeShapes and every pure geometry/analysis helper.
