/**
 * HTTP 边界：base URL、Bearer、超时与统一错误信封。
 *
 * 所有请求必须经这里发出；业务模块只负责拼新后端（runtime-openapi.json）的路径。
 * 旧 api.ts 里的 20 条接口声明已全部移除，新栈没有的路径不会再出现在客户端。
 */
import type { components } from "./openapi";

/** 内核默认地址；用户可通过 localStorage 的 ntv.apiBase 或 VITE_API_BASE 覆盖。 */
export const DEFAULT_BASE = "http://127.0.0.1:2003";

/** 本机部署的超时上限：超过 8s 基本等于不可达，早失败早显示重试。 */
export const REQUEST_TIMEOUT_MS = 8000;

type ErrorEnvelope = components["schemas"]["ErrorEnvelope"];

/** 后端 ErrorEnvelope + 网络/超时本地 code 的统一错误类型。 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly traceId: string | null;
  readonly field: string | null;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    traceId?: string | null;
    field?: string | null;
  }) {
    super(init.message);
    this.name = "ApiClientError";
    this.status = init.status;
    this.code = init.code;
    this.traceId = init.traceId ?? null;
    this.field = init.field ?? null;
  }
}

/** 保留旧名称，页面/日志里的 `instanceof ApiError` 仍然成立。 */
export { ApiClientError as ApiError };

/** 与旧客户端一致的 base URL 解析优先级：运行时设置 > 构建变量 > 默认值。 */
export function baseUrl(): string {
  const override = localStorage.getItem("ntv.apiBase");
  return (override || import.meta.env.VITE_API_BASE || DEFAULT_BASE).replace(/\/$/, "");
}

function authToken(): string | null {
  return localStorage.getItem("ntv.token");
}

function errorFromResponse(res: Response, envelope: Partial<ErrorEnvelope> | null): ApiClientError {
  return new ApiClientError({
    status: res.status,
    code: envelope?.code ?? `HTTP_${res.status}`,
    message: envelope?.message ?? res.statusText ?? "request failed",
    traceId: envelope?.traceId ?? res.headers.get("X-Trace-Id") ?? null,
    field: envelope?.field ?? null,
  });
}

/** 发起 JSON 请求；4xx/5xx 解析 ErrorEnvelope，204 返回 undefined。 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  const token = authToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl()}${path}`, { ...init, headers, signal: controller.signal });
    if (!res.ok) {
      let envelope: Partial<ErrorEnvelope> | null = null;
      try {
        envelope = (await res.json()) as Partial<ErrorEnvelope>;
      } catch {
        // 非 JSON 错误体：保留 HTTP 状态码与响应头里的 trace id
      }
      throw errorFromResponse(res, envelope);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (controller.signal.aborted) {
      throw new ApiClientError({
        status: 0,
        code: "timeout",
        message: `请求超时（${REQUEST_TIMEOUT_MS / 1000}s）：${path}`,
      });
    }
    throw new ApiClientError({
      status: 0,
      code: "network",
      message: error instanceof Error ? error.message : "网络请求失败",
    });
  } finally {
    clearTimeout(timer);
  }
}
