/**
 * Prism 同步事件 —— 内核 webhook → 统一事件 → 中间层广播（WebSocket/SSE）→ 前端本地库。
 *
 * 读路径 local-first 的数据流：适配器把内核 webhook 载荷解析成这些统一事件；
 * 中间层只认识统一事件，不认识任何内核格式。
 *
 * @license Apache-2.0
 */

/** @typedef {'issue.created'|'issue.updated'|'issue.deleted'|'issue.transitioned'
 *            |'comment.created'|'comment.updated'|'comment.deleted'
 *            |'iteration.updated'|'meta.updated'} PrismEventType */

/**
 * @typedef {object} PrismEvent
 * @property {string} eventId          内核事件去重键（webhook 幂等）
 * @property {PrismEventType} type
 * @property {string} tenantId
 * @property {string} projectKey
 * @property {{issueId?:string, commentId?:string, actorKernelUserId?:string, at:number}} subject
 * @property {unknown} [payload]       事件细节（v0 允许宽松，v1 收紧为带类型载荷）
 */

/** @typedef {object} WebhookParser
 * @property {(headers:Record<string,string>, rawBody:string|Buffer) => boolean} verify   验签（无签内核恒 true）
 * @property {(headers:Record<string,string>, rawBody:string|Buffer) => PrismEvent[]} parse  解析为统一事件（一批可多条）
 */
