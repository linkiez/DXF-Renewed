# Nesting CAM Specifications

These independently plannable specifications cover [ROADMAP-NESTING.md](../ROADMAP-NESTING.md).

| Order | Specification | Scope | Depends on |
|---|---|---|---|
| 001 | `part-preparation` | Cuttable parts, repair, classification, kerf | Existing DXF extraction |
| 002 | `true-shape-nesting` | Placement, sheets, remnants, true-shape geometry | 001 |
| 003 | `nesting-optimization-gpu` | Objectives, repeatability, optional acceleration | 002 |
| 004 | `cut-path-planning` | Cut sequencing, pierce, leads, tabs, common-line | 001, 002 |
| 005 | `modular-post-processing` | Laser/plasma program generation and validation | 004 |
| 006 | `stateless-erp-contract` | Request/response, traceability and ERP boundary | 001–005 |
| 007 | `nesting-simulation` | Pre-release visual review and playback | 004, 006 |
| 008 | `nesting-cost-reporting` | Quote, production artifact and ERP exports | 005, 006 |

`.specify/feature.json` points at `001-part-preparation`. Update that pointer before running
planning for a different specification.
