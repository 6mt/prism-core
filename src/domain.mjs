/**
 * Prism 领域模型 v0 —— 前端永远只面向这些概念，永不直接见内核字段。
 *
 * 设计原则：
 * 1. 概念克制（Linear 式）：Issue / View / Iteration / Comment / Transition 足够表达
 *    日常研发 90% 的操作；重型概念（流程模板/字段配置）留在内核。
 * 2. 每个实体有 prism 自己的 id 体系（kernel 前缀 + 内核 id），适配器负责映射，
 *    保证换内核时前端 ID 稳定。
 * 3. 所有时间为 epoch 毫秒；所有枚举用小写字符串，跨内核稳定。
 *
 * @license Apache-2.0
 */

/** @typedef {'open' | 'in_progress' | 'done' | 'cancelled'} IssueStatusCategory */

/**
 * 工作项状态（内核流程节点的投影）。
 * @typedef {object} IssueStatus
 * @property {string} id          prism id，如 `fs:node_123`
 * @property {string} name        展示名，如「设计中」
 * @property {IssueStatusCategory} category 状态大类（看板列的分组依据）
 */

/**
 * 工作项。Prism 的中心实体。
 * @typedef {object} Issue
 * @property {string} id                prism id，如 `fs:issue_88001`
 * @property {string} key               人类可读键，如 `PRJ-1234`
 * @property {string} projectKey        所属空间（内核 project_key）
 * @property {string} typeKey           工作项类型，如 `story` | `bug` | `task`（映射自内核类型）
 * @property {string} title
 * @property {string} [description]     富文本（内核原格式，前端渲染层再解释）
 * @property {IssueStatus} status
 * @property {KernelUserRef} [assignee] 负责人（缺省 = 未指派）
 * @property {string} [priority]        如 `urgent` | `high` | `medium` | `low`（内核枚举映射）
 * @property {string[]} [labelIds]
 * @property {string} [iterationId]     所属迭代
 * @property {number} [estimate]        故事点/估时
 * @property {{createdAt:number, updatedAt:number, startedAt?:number, dueAt?:number, completedAt?:number}} dates
 * @property {{projectId:string, url:string}} [link]     跳回内核 UI 的深链（盲区功能逃生口）
 */

/** @typedef {{kernelUserId:string, name:string, avatarUrl?:string}} KernelUserRef */

/**
 * 工作项类型（内核工作项类型的投影）。
 * @typedef {object} WorkItemType
 * @property {string} key      如 `story`
 * @property {string} name     如「需求」
 * @property {string} [icon]
 */

/**
 * 空间（内核 project 的投影）。Prism 不创建/配置空间（内核盲区，见 STRATEGY §6）。
 * @typedef {object} ProjectSpace
 * @property {string} key        内核 project_key，如 `myteam_prj`
 * @property {string} name
 * @property {string} [description]
 */

/**
 * 迭代/冲刺。
 * @typedef {object} Iteration
 * @property {string} id
 * @property {string} name       如「Sprint 24」
 * @property {number} startsAt
 * @property {number} endsAt
 * @property {'active'|'upcoming'|'completed'} state
 */

/**
 * 保存的视图（列表/看板的筛选+布局持久化；kernel 视图或 prism 本地视图）。
 * @typedef {object} SavedView
 * @property {string} id
 * @property {string} name
 * @property {IssueFilter} filter
 * @property {'list'|'board'|'gantt'} [layout]
 * @property {{field:'status'|'assignee'|'priority'|'iteration'|'type', dir:'asc'|'desc'}} [groupBy]
 */

/**
 * 结构化筛选（命令面板/过滤条的产物；适配器翻译成内核查询）。
 * @typedef {object} IssueFilter
 * @property {string[]} [typeKeys]
 * @property {string[]} [statusIds]
 * @property {string[]} [kernelUserIds]   含特殊值 `unassigned`
 * @property {string[]} [iterationIds]    含特殊值 `none`
 * @property {string[]} [priorities]
 * @property {string[]} [labelIds]
 * @property {string} [search]            标题/描述关键词
 * @property {{updatedAtAfter?:number, createdAtAfter?:number}} [time]
 */

/**
 * 评论。
 * @typedef {object} Comment
 * @property {string} id
 * @property {string} issueId
 * @property {KernelUserRef} author
 * @property {string} body
 * @property {number} createdAt
 * @property {number} [updatedAt]
 */

/**
 * 状态流转记录（看板拖拽的产物；也用于冲突检测——本地已知 fromStatus 与内核当前不一致时拒绝）。
 * @typedef {object} Transition
 * @property {string} issueId
 * @property {string} fromStatusId
 * @property {string} toStatusId
 * @property {KernelUserRef} by
 * @property {number} at
 */

/**
 * 创建工作项的输入。
 * @typedef {object} IssueCreateInput
 * @property {string} projectKey
 * @property {string} typeKey
 * @property {string} title
 * @property {string} [description]
 * @property {string} [kernelUserId]
 * @property {string} [priority]
 * @property {string} [iterationId]
 */

/**
 * 更新工作项的输入（patch 语义，只传要改的）。
 * @typedef {object} IssueUpdateInput
 * @property {string} projectKey
 * @property {string} typeKey
 * @property {string} issueId
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [kernelUserId]     传 `unassigned` 表示清空
 * @property {string} [priority]
 * @property {string} [iterationId]
 * @property {number} [estimate]
 */

/** 分页结果。 @typedef {object} Paged<T> @property {T[]} items @property {string} [nextCursor] */
