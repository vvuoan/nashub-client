/**
 * 兼容导入层：旧的 20 条接口声明已全部删除，页面/Demo 的 `../data/api` 导入路径保留。
 * 新实现按域拆分在 ./api/*，全部基于 docs/api/runtime-openapi.json。
 */
export * from "./api/index";
