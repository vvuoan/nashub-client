import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LiveChannel, LiveEpgResponse, LiveProgramme } from "../../data/api";
import type { ConnState } from "../../types";

interface LiveGuideProps {
  channels: LiveChannel[];
  selectedId: string | null;
  board: Record<string, LiveEpgResponse>;
  state: ConnState;
  /** 某行进入视口时按需补该频道的节目单 */
  onLoad: (channelId: string) => void;
}

/** 时间轴跨度 3 小时，刻度 30 分钟；首屏显示 30–60 分钟历史，其余为未来。 */
const WINDOW_MIN = 180;
const STEP_MIN = 30;
const TICK_COUNT = WINDOW_MIN / STEP_MIN;

function hm(value: number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function today(): string {
  const now = new Date();
  return `${now.getMonth() + 1}月${now.getDate()}日`;
}

/** 窗口起点：当前时刻往前退一格，并对齐到 30 分钟。 */
function windowStart(now: number): number {
  const date = new Date(now);
  date.setSeconds(0, 0);
  date.setMinutes(Math.floor(date.getMinutes() / STEP_MIN) * STEP_MIN - STEP_MIN);
  return date.getTime();
}

interface Segment {
  key: string;
  title: string;
  start: number;
  stop: number;
  left: number;
  width: number;
  live: boolean;
  past: boolean;
  clipped: boolean;
}

function segmentsOf(
  epg: LiveEpgResponse | undefined,
  start: number,
  end: number,
  now: number,
): Segment[] {
  if (!epg) return [];
  const all: LiveProgramme[] = [...(epg.current ? [epg.current] : []), ...epg.upcoming];
  const span = end - start;
  const out: Segment[] = [];
  for (const item of all) {
    const from = Date.parse(item.startAt);
    const to = Date.parse(item.stopAt);
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) continue;
    if (to <= start || from >= end) continue;
    const left = Math.max(from, start);
    const right = Math.min(to, end);
    out.push({
      key: `${item.startAt}-${item.title}`,
      title: item.title,
      start: from,
      stop: to,
      left: ((left - start) / span) * 100,
      width: ((right - left) / span) * 100,
      live: from <= now && now < to,
      past: to <= now,
      clipped: from < start,
    });
  }
  return out;
}

/** 底下整幅：按频道行的课程表，时间轴横向铺开，红线表示当前时刻。 */
export function LiveGuide({ channels, selectedId, board, state, onLoad }: LiveGuideProps) {
  const [now, setNow] = useState(() => Date.now());
  const bodyRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef(board);
  boardRef.current = board;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const start = useMemo(() => windowStart(now), [now]);
  const end = start + WINDOW_MIN * 60_000;
  const nowPct = (now - start) / (end - start);

  const ticks = useMemo(
    () => Array.from({ length: TICK_COUNT }, (_, i) => start + i * STEP_MIN * 60_000),
    [start],
  );

  const pending =
    state === "loading" ||
    state === "error" ||
    state === "unreachable" ||
    state === "unauthorized";

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || pending) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const channelId = (entry.target as HTMLElement).dataset.ch;
          if (channelId && !boardRef.current[channelId]) onLoad(channelId);
        }
      },
      { root: body, rootMargin: "0px 0px 160px 0px" },
    );
    body.querySelectorAll<HTMLElement>("[data-ch]").forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [channels, pending, onLoad]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !selectedId) return;
    const row = body.querySelector<HTMLElement>(`[data-ch="${selectedId}"]`);
    if (!row) return;
    const top = row.offsetTop - body.offsetTop;
    const bottom = top + row.offsetHeight;
    if (top < body.scrollTop) body.scrollTo({ top, behavior: "smooth" });
    else if (bottom > body.scrollTop + body.clientHeight) {
      body.scrollTo({ top: bottom - body.clientHeight, behavior: "smooth" });
    }
  }, [selectedId]);

  return (
    <section
      className="live-col live-epg"
      aria-label="节目单"
      style={{ "--now": nowPct } as CSSProperties}
    >
      <div className="live-tl-head">
        <div className="live-tl-corner">
          <h3>节目单</h3>
          <em>{today()}</em>
        </div>
        <div className="live-tl-axis">
          {ticks.map((tick) => (
            <span
              className="live-tl-tick"
              key={tick}
              style={{ left: `${((tick - start) / (end - start)) * 100}%` }}
            >
              {hm(tick)}
            </span>
          ))}
        </div>
      </div>

      <div className="live-tl-body" ref={bodyRef}>
        {pending &&
          Array.from({ length: 6 }, (_, i) => (
            <div className="live-tl-row" key={`tl-ph-${i}`} aria-hidden="true">
              <span className="live-tl-ch">
                <span className="live-tl-sk-name" />
              </span>
              <span className="live-tl-track">
                <span className="live-tl-sk" />
              </span>
            </div>
          ))}

        {!pending && channels.length === 0 && (
          <div className="live-tl-empty">
            <div className="live-empty-inline">
              <p>这个分组还没有频道</p>
              <span>换一个分组，或在设置「来源」里刷新直播源</span>
            </div>
          </div>
        )}

        {!pending &&
          channels.map((item) => {
            const epg = board[item.channelId];
            const segments = segmentsOf(epg, start, end, now);
            return (
              <div
                className={item.channelId === selectedId ? "live-tl-row on" : "live-tl-row"}
                key={item.channelId}
                data-ch={item.channelId}
              >
                <span className="live-tl-ch" title={item.name}>
                  {item.name}
                </span>
                <span className="live-tl-track">
                  {!epg && <span className="live-tl-sk" />}
                  {epg && segments.length === 0 && <span className="live-tl-none">暂无节目单</span>}
                  {segments.map((segment) => (
                    <span
                      className={[
                        "live-tl-prog",
                        segment.past ? "past" : "",
                        segment.live ? "live" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={segment.key}
                      style={{
                        left: `${segment.left}%`,
                        width: `${segment.width}%`,
                      }}
                      title={`${hm(segment.start)} – ${hm(segment.stop)} ${segment.title}`}
                    >
                      {!segment.clipped && segment.width > 11 && (
                        <span className="tt">{hm(segment.start)}</span>
                      )}
                      <span className="nm">{segment.title}</span>
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
      </div>
    </section>
  );
}
