import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../components/base/Button";
import { FocusScope } from "../components/base/FocusScope";
import { api } from "../data/api";
import { describe } from "../data/home";

type MusicState = "loading" | "ready" | "unconfigured" | "unreachable" | "error" | "timeout";

interface MusicPageProps {
  /** 开发预览：placeholder 走占位 iframe，empty 走未配置空态 */
  preview?: "placeholder" | "empty";
  onBack?: () => void;
}

const PLACEHOLDER_SRC = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<style>
  html,body{height:100%;margin:0;background:#0b0e12;color:#fff;font-family:-apple-system,"SF Pro Text","PingFang SC",sans-serif}
  body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}
  .logo{width:96px;height:96px;border-radius:28px;border:1px solid rgba(255,255,255,.18);display:grid;place-items:center;font-size:34px;font-weight:600;letter-spacing:1px;color:rgba(255,255,255,.86)}
  h1{margin:0;font-size:34px;font-weight:300;letter-spacing:2px}
  p{margin:0;font-size:15px;color:rgba(255,255,255,.45)}
  .bar{position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,#d8a657,rgba(216,166,87,0))}
</style>
</head>
<body>
  <div class="logo">F</div>
  <h1>Folia</h1>
  <p>占位应用页 · 等待 Folia 接入后替换</p>
  <span class="bar"></span>
  <script>
    for (const type of ["keydown"]) {
      window.addEventListener(type, (event) => {
        if (event.key === "Escape" || event.key === "Backspace" || event.key === "BrowserBack") {
          event.preventDefault();
          parent.postMessage({ type: "folia-exit" }, "*");
        }
      });
    }
  </script>
</body>
</html>`;

/**
 * 音乐页：整页 Folia iframe，外层只保留标题、返回与边界条。
 * 未配置 / 加载超时 / 未连接都给明确空态，不出现白屏或无限转圈。
 */
export function MusicPage({ preview, onBack }: MusicPageProps) {
  const [state, setState] = useState<MusicState>(preview ? (preview === "empty" ? "unconfigured" : "ready") : "loading");
  const [message, setMessage] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const placeholder = preview === "placeholder";

  useEffect(() => {
    if (preview) {
      setState(preview === "empty" ? "unconfigured" : "ready");
      setFrameLoaded(false);
      return;
    }
    let alive = true;
    setState("loading");
    setMessage(null);
    void api
      .musicStatus()
      .then((status) => {
        if (!alive) return;
        if (status.configured && status.baseUrl) {
          setBaseUrl(status.baseUrl);
          setState("ready");
          setFrameLoaded(false);
        } else {
          setState("unconfigured");
          setMessage(status.message || null);
        }
      })
      .catch((error) => {
        if (!alive) return;
        const next = describe(error);
        setState(next.state === "unreachable" ? "unreachable" : "error");
        setMessage(next.message);
      });
    return () => {
      alive = false;
    };
  }, [preview, reloadKey]);

  useEffect(() => {
    if (state !== "ready") return;
    const timer = window.setTimeout(() => {
      setState((current) => (current === "ready" && !frameLoaded ? "timeout" : current));
    }, 10_000);
    return () => window.clearTimeout(timer);
  }, [state, frameLoaded, reloadKey]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "object" && event.data.type === "folia-exit") {
        document.querySelector<HTMLElement>('[data-focus-key="music:enter"]')?.focus();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const enter = useCallback(() => {
    frameRef.current?.focus();
  }, []);

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return (
    <FocusScope name="music" className="music-page" autoFocus>
      <header className="music-head">
        <div>
          <h1>音乐</h1>
          <p>
            Folia 整页 · 内容区宽度 95%，外层只做边界与返回
            {placeholder ? " · Esc 先退出 iframe 焦点" : ""}
          </p>
        </div>
        <div className="music-actions">
          {state === "ready" && (
            <Button variant="ghost" focusKey="music:enter" onSelect={enter}>
              进入音乐
            </Button>
          )}
          {state !== "ready" && state !== "loading" && (
            <Button variant="ghost" focusKey="music:retry" onSelect={retry}>
              重试
            </Button>
          )}
          {onBack && (
            <Button variant="ghost" focusKey="music:back" onSelect={onBack}>
              返回
            </Button>
          )}
        </div>
      </header>

      {state === "ready" && (baseUrl || placeholder) && (
        <div className="music-frame">
          <iframe
            ref={frameRef}
            title="Folia 音乐"
            tabIndex={0}
            src={placeholder ? undefined : (baseUrl ?? undefined)}
            srcDoc={placeholder ? PLACEHOLDER_SRC : undefined}
            allow="autoplay; fullscreen"
            onLoad={() => setFrameLoaded(true)}
          />
        </div>
      )}

      {state !== "ready" && (
        <div className="music-frame music-frame-empty">
          {state === "loading" && (
            <div className="music-empty">
              <h2>正在检测音乐服务</h2>
              <p>请求 /v1/music/status · 最多等待 10 秒</p>
            </div>
          )}

          {state === "unconfigured" && (
            <div className="music-empty">
              <h2>音乐服务未配置</h2>
              <p>在 NAS 端填写 Folia 地址后重试。音乐内容由 Folia 自己渲染，客户端不自绘播放器。</p>
              <Button variant="ghost" focusKey="music:retry" onSelect={retry}>
                重试
              </Button>
            </div>
          )}

          {state === "timeout" && (
            <div className="music-empty">
              <h2>Folia 加载超时</h2>
              <p>10 秒内没有收到页面加载完成事件。请确认 Folia 地址可访问，或稍后重试。</p>
              <Button variant="ghost" focusKey="music:retry" onSelect={retry}>
                重试
              </Button>
            </div>
          )}

          {(state === "unreachable" || state === "error") && (
            <div className="music-empty">
              <h2>{state === "unreachable" ? "未连接后端" : "音乐服务请求失败"}</h2>
              <p>{message || "无法读取音乐服务状态"}</p>
              <Button variant="ghost" focusKey="music:retry" onSelect={retry}>
                重试
              </Button>
            </div>
          )}
        </div>
      )}
    </FocusScope>
  );
}
