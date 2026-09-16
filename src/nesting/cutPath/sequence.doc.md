# Cut-path sequencing

`sequence.ts` orders contours without mutating caller-owned arrays. Inner contours are always
eligible before their associated outer contour. Nearest-neighbour selection and stable, bounded
2-opt use contour identifiers and input indexes as deterministic tie-breakers.
