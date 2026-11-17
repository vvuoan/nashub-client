import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { MpvProbe, PlayOptions, PlayerHost, PlayerStatus } from "./PlayerHost";

const EVENT = "player://event";

type StatusListener = (status: Partial<PlayerStatus>) => void;

interface MpvEvent {
  event?: string;
  name?: string;
  data?: unknown;
}

/**
 * 外部 mpv 进程 + JSON IPC 实现。
 * Rust 侧（src-tauri/src/player.rs）负责启动 mpv、连接命名管道，并把每条 JSON 事件
 * 以 `player://event` 转发到前端；这里只做命令下发与状态归并。
 */
export class MpvIpcPlayer implements PlayerHost {
  private unlisten: UnlistenFn | null = null;
  private readonly listeners = new Set<StatusListener>();
  private status: PlayerStatus = { paused: false, position: 0, duration: 0, eof: false };
  private starting: Promise<void> | null = null;

  private async ensureListening(): Promise<void> {
    if (this.unlisten) return;
    this.unlisten = await listen<MpvEvent>(EVENT, ({ payload }) => this.consume(payload));
  }

  private emit(patch: Partial<PlayerStatus>): void {
    this.status = { ...this.status, ...patch };
    for (const listener of this.listeners) listener(patch);
  }

  private consume(payload: MpvEvent): void {
    const name = payload.event;

    if (name === "property-change") {
      switch (payload.name) {
        case "time-pos":
          if (typeof payload.data === "number") this.emit({ position: payload.data });
          break;
        case "duration":
          if (typeof payload.data === "number") this.emit({ duration: payload.data });
          break;
        case "pause":
          if (typeof payload.data === "boolean") this.emit({ paused: payload.data });
          break;
        case "eof-reached":
          if (typeof payload.data === "boolean") this.emit({ eof: payload.data });
          break;
        default:
          break;
      }
      return;
    }

    if (name === "file-loaded") {
      this.emit({ position: 0, eof: false });
      return;
    }

    if (name === "end-file") {
      this.emit({ eof: true });
    }
  }

  private async send(command: unknown[]): Promise<void> {
    await invoke("player_command", { command: { command } });
  }

  async play(source: string, options?: PlayOptions): Promise<void> {
    await this.ensureListening();
    const extra = options?.startSeconds
      ? [`--start=${Math.max(0, options.startSeconds)}`]
      : [];
    this.starting = invoke<void>("player_start", { media: source, extra });
    await this.starting;
    this.starting = null;
    this.emit({ paused: false, position: options?.startSeconds ?? 0, duration: 0, eof: false });
  }

  async pause(): Promise<void> {
    await this.send(["set_property", "pause", true]);
  }

  async resume(): Promise<void> {
    await this.send(["set_property", "pause", false]);
  }

  async seek(seconds: number): Promise<void> {
    await this.send(["seek", Math.max(0, seconds), "absolute"]);
  }

  async stop(): Promise<void> {
    await invoke("player_stop");
    this.emit({ paused: false, position: 0, eof: false });
  }

  async setVolume(volume: number): Promise<void> {
    const clamped = Math.max(0, Math.min(100, volume));
    await this.send(["set_property", "volume", clamped]);
  }

  async setSubtitleTrack(trackId: string | "no"): Promise<void> {
    await this.send(["set_property", "sid", trackId]);
  }

  onStatus(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async dispose(): Promise<void> {
    this.listeners.clear();
    this.unlisten?.();
    this.unlisten = null;
    await this.stop().catch(() => undefined);
  }
}

/** 创建前先探测 mpv 是否可用，避免起播时才报错。 */
export async function createPlayerHost(): Promise<PlayerHost> {
  const probe = await invoke<MpvProbe>("player_probe");
  if (!probe.found) {
    throw new Error(
      "未找到 mpv：请安装 mpv，或把 mpv.exe 放到应用目录 / binaries，或设置 NASTV_MPV",
    );
  }
  return new MpvIpcPlayer();
}
