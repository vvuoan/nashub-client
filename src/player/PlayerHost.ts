/**
 * 播放抽象。UI 只依赖本接口，不关心内核是外部 mpv 进程还是别的实现。
 * 当前实现：src/player/MpvIpcPlayer.ts（mpv + JSON IPC）。
 */
export interface PlayerStatus {
  paused: boolean;
  /** 当前播放位置（秒） */
  position: number;
  /** 总时长（秒），未知时为 0 */
  duration: number;
  eof: boolean;
}

export interface PlayOptions {
  /** 从第几秒开始播放 */
  startSeconds?: number;
}

export interface PlayerHost {
  play(source: string, options?: PlayOptions): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(seconds: number): Promise<void>;
  stop(): Promise<void>;
  /** 0–100 */
  setVolume(volume: number): Promise<void>;
  /** "no" 关闭字幕 */
  setSubtitleTrack(trackId: string | "no"): Promise<void>;
  /** 订阅状态变化；返回取消订阅函数 */
  onStatus(listener: (status: Partial<PlayerStatus>) => void): () => void;
  dispose(): Promise<void>;
}

export interface MpvProbe {
  found: boolean;
  path: string | null;
  source: string | null;
}
