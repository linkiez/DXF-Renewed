# Cut-path validation helpers

`validate.ts` separates malformed input from expected geometric failures. Structural layout and
profile errors throw explicit messages before planning. Valid layouts return actionable
`CutPathProblem` entries for bounds violations, pierce-clearance violations, unusable entries,
rapid travel through kept material and rejected common-line candidates. Verified shared edges are
returned for the planner so valid common-line actions can be emitted without bypassing validation.
