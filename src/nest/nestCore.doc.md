# Nesting Core

`nestCore.ts` adapts extracted `NestPart` values to the embedded SVGnest
placement worker and converts placements back to the public nesting model.

Each single-bin run creates a local seeded random generator and passes it
through the placement context. This keeps repeated subscriptions deterministic
without sharing mutable random state between concurrent runs.
