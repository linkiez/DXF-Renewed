# Cut-path planner

`plan.ts` validates structural inputs, sequences contours, emits machine-independent actions
including verified common-line actions, and returns one complete plan per sheet with aggregated
travel metrics and structured geometric or process problems. Structural contract violations throw;
expected validation failures remain in `CutPlanResult`.
