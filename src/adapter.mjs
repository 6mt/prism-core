/**
 * Prism 内核适配器接口 —— 一切内核（飞书项目/ONES/Jira/自建 DB）实现此契约。
 *
 * 契约原则：
 * 1. 能力协商：内核差异巨大，capabilities() 先问清楚，前端按能力降级 UI。
 * 2. 写操作必须可幂等：带 idempotencyKey 的写在中断重试后不得产生重复数据。
 * 3. 抛错用 KernelError，带 code（'quota' | 'conflict' | 'auth' | 'not_found' | 'network' | 'unknown'），
 *    中间层据此决定重试/排队/报 UI。
 * 4. 适配器无状态、可并发调用；token 刷新/缓存由适配器内部自理。
 *
 * @license Apache-2.0
 */

/** 内核能力声明。 @typedef {object} KernelCapabilities
 * @property {boolean} writes              是否支持写（只读内核也能接）
 * @property {boolean} webhookSync         是否支持事件订阅（决定读同步用 webhook 还是轮询）
 * @property {number}  writesPerMinute     写配额估计（写队列限速依据）
 * @property {boolean} batchUpdate         是否支持批量更新字段
 * @property {boolean} comments            是否支持评论
 * @property {boolean} attachments         是否支持附件
 * @property {boolean} gantt               是否支持节点排期（甘特数据源）
 * @property {boolean} crossProjectSearch  是否支持跨空间搜索
 */

/** 适配器调用上下文（多租户一等公民：每次调用都带租户）。 @typedef {object} AdapterContext
 * @property {string} tenantId    租户 id（内部部署时 = 公司 id）
 * @property {string} [actorKernelUserId]  以谁的身份执行（审计与人称正确性）
 */

/** @typedef {import('./domain.mjs').ProjectSpace} ProjectSpace */
/** @typedef {import('./domain.mjs').WorkItemType} WorkItemType */
/** @typedef {import('./domain.mjs').Issue} Issue */
/** @typedef {import('./domain.mjs').IssueFilter} IssueFilter */
/** @typedef {import('./domain.mjs').IssueCreateInput} IssueCreateInput */
/** @typedef {import('./domain.mjs').IssueUpdateInput} IssueUpdateInput */
/** @typedef {import('./domain.mjs').Comment} Comment */
/** @typedef {import('./domain.mjs').Transition} Transition */
/** @typedef {import('./domain.mjs').Iteration} Iteration */
/** @typedef {import('./domain.mjs').SavedView} SavedView */
/** @typedef {import('./domain.mjs').Paged<T>} Paged */

/** 内核错误。 */ 
export class KernelError extends Error {
  /**
   * @param {'quota'|'conflict'|'auth'|'not_found'|'network'|'unknown'} code
   * @param {string} message
   * @param {{retryable?:boolean, retryAfterMs?:number, kernelRaw?:unknown}} [meta]
   */
  constructor(code, message, meta = {}) {
    super(message);
    this.name = 'KernelError';
    this.code = code;
    this.retryable = meta.retryable ?? (code === 'quota' || code === 'network');
    this.retryAfterMs = meta.retryAfterMs;
    this.kernelRaw = meta.kernelRaw;
  }
}

/**
 * 内核适配器接口（JSDoc 契约；运行期不做强校验，由 smoke/契约测试保证）。
 * @typedef {object} KernelAdapter
 * @property {() => KernelCapabilities} capabilities
 *
 * ---- 空间与元数据（读） ----
 * @property {(ctx:AdapterContext) => Promise<ProjectSpace[]>} listSpaces
 * @property {(ctx:AdapterContext, projectKey:string) => Promise<WorkItemType[]>} listWorkItemTypes
 * @property {(ctx:AdapterContext, projectKey:string) => Promise<Iteration[]>} listIterations
 *
 * ---- 工作项（读） ----
 * @property {(ctx:AdapterContext, projectKey:string, filter:IssueFilter, cursor?:string, limit?:number) => Promise<Paged<Issue>>} listIssues
 * @property {(ctx:AdapterContext, projectKey:string, typeKey:string, issueIds:string[]) => Promise<Issue[]>} getIssues
 *
 * ---- 工作项（写，全部支持幂等键） ----
 * @property {(ctx:AdapterContext, input:IssueCreateInput, idempotencyKey:string) => Promise<Issue>} createIssue
 * @property {(ctx:AdapterContext, input:IssueUpdateInput, idempotencyKey:string) => Promise<Issue>} updateIssue
 * @property {(ctx:AdapterContext, transition:Transition & {projectKey:string, typeKey:string}, idempotencyKey:string) => Promise<Issue>} transitionIssue
 * @property {(ctx:AdapterContext, ref:{projectKey:string, typeKey:string, issueId:string}, expectedStatusId?:string) => Promise<void>} deleteIssue
 *
 * ---- 评论 ----
 * @property {(ctx:AdapterContext, ref:{projectKey:string, typeKey:string, issueId:string}) => Promise<Comment[]>} listComments
 * @property {(ctx:AdapterContext, ref:{projectKey:string, typeKey:string, issueId:string}, body:string, idempotencyKey:string) => Promise<Comment>} addComment
 *
 * ---- 视图 ----
 * @property {(ctx:AdapterContext, projectKey:string) => Promise<SavedView[]>} listViews
 * @property {(ctx:AdapterContext, projectKey:string, viewId:string, cursor?:string) => Promise<Paged<Issue>>} listIssuesInView
 */

/** 恒等辅助：把内核原始 id 包装成 prism id。 @param {string} kernel @param {string} rawId @returns {string} */
export const prismId = (kernel, rawId) => `${kernel}:${rawId}`;

/** 反解 prism id。 @param {string} id @returns {{kernel:string, rawId:string}} */
export const parsePrismId = (id) => {
  const i = id.indexOf(':');
  if (i < 0) throw new Error(`invalid prism id: ${id}`);
  return { kernel: id.slice(0, i), rawId: id.slice(i + 1) };
};
