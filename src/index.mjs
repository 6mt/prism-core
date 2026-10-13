/**
 * @prism/core 入口。
 * domain.mjs 为纯类型定义（JSDoc typedef，无运行时导出）；
 * 运行时导出：KernelError / prismId / parsePrismId（见 adapter.mjs）。
 * @license Apache-2.0
 */
export { KernelError, prismId, parsePrismId } from './adapter.mjs';
