---
name: update-spec
description: "Captures executable contracts and coding knowledge into .trellis/spec/ documents after implementation, debugging, or design decisions. Enforces code-spec depth for infra and cross-layer changes with mandatory sections for signatures, contracts, validation matrices, and test points. Use when a feature is implemented, a bug is fixed, a design decision is made, a new pattern is discovered, or cross-layer contracts change."
---

# Update Spec

Use when a change creates or modifies a durable contract.

## Update only when needed

Update specs for:

- API/schema/envelope changes;
- persistence/default semantics;
- cross-layer data flow;
- security/privacy boundary;
- reusable implementation pattern.

Do not update specs for one-off copy/layout tweaks.

## Format

Keep additions short:

- contract/signature;
- allowed/forbidden behavior;
- validation points;
- affected files/tests.

Prefer focused spec files. Do not append long scenario dumps to general guides.
