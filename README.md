# @prism/core

**Kernel-agnostic domain model and adapter interface for project-management workbenches.**
One kernel stores the data — any kernel. One layer makes it a joy to use.

`@prism/core` defines a small, Linear-style issue model (`Issue` / `View` / `Iteration` /
`Comment` / `Transition`) and the `KernelAdapter` contract that any backing system
implements. Build your UI once against this model; swap or mix kernels (Feishu Project,
Jira, ONES, TAPD, your own DB) behind the same interface.

## Design principles

1. **Restrained schema** — five entities cover 90% of daily R&D work; heavyweight
   concepts (workflow templates, field config) stay in the kernel.
2. **Stable IDs** — every entity carries a prism-scoped id (`kernel:rawId`), so the
   frontend never breaks when the kernel changes.
3. **Capability negotiation** — `capabilities()` declares what the kernel supports;
   the UI degrades gracefully instead of assuming.
4. **Idempotent writes** — every write accepts an idempotency key; kernel errors map
   to a typed `KernelError` (`quota` / `conflict` / `auth` / `not_found` / `network`).
5. **Multi-tenant first** — every adapter call carries a tenant context.

## Usage

```js
import { KernelError, prismId, parsePrismId } from '@prism/core';
// KernelAdapter contract: see src/adapter.mjs (JSDoc-typed)
// Domain entities:     see src/domain.mjs
// Sync events:         see src/events.mjs
```

The reference adapter (Feishu Project / Meegle OpenAPI) lives in a separate repo.

## License

Apache-2.0 — see [LICENSE](LICENSE). Contributions require the
[CLA](docs/CLA.md).
