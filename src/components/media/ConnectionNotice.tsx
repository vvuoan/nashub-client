import { Focusable } from "../base/Focusable";
import type { ConnState } from "../../types";

interface ConnectionNoticeProps {
  state: ConnState;
  message: string | null;
  onRetry: () => void;
}

const TITLES: Record<ConnState, string> = {
  loading: "正在连接后端",
  ok: "",
  empty: "后端已连接，暂无内容",
  unauthorized: "后端拒绝访问（401）",
  unreachable: "未连接后端",
  error: "后端请求失败",
};

const DETAILS: Record<ConnState, string> = {
  loading: "",
  ok: "",
  empty: "接口返回 0 条记录",
  unauthorized: "本机 IP 不在白名单或 token 为空",
  unreachable: "请确认后端已启动并能访问",
  error: "",
};

/**
 * 真实连接状态条：不隐藏失败，不拿演示数据充数。
 * 重试按钮参与遥控器焦点链。
 */
export function ConnectionNotice({ state, message, onRetry }: ConnectionNoticeProps) {
  if (state === "ok") return null;

  const detail = message || DETAILS[state];

  return (
    <div className={`conn state-${state}`} role="status">
      <span className="dot" aria-hidden="true" />
      <span className="txt">
        <span className="ct">{TITLES[state]}</span>
        {detail && <span className="cd">{detail}</span>}
      </span>
      {state !== "loading" && (
        <Focusable className="retry" focusKey="conn:retry" onSelect={onRetry}>
          重试
        </Focusable>
      )}
    </div>
  );
}
