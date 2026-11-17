import { useCallback, useEffect, useRef, useState } from "react";
import {
  api,
  type LiveChannel,
  type LiveEpgResponse,
  type LiveGroupCount,
  type LiveProgramme,
} from "../data/api";
import { describe } from "../data/home";
import type { ConnState } from "../types";

/** 后端没有分组数据时仍给出四个既定页签，计数显示占位。 */
const GROUP_FALLBACK: LiveGroupCount[] = [
  { group: "cctv", label: "央视", count: 0 },
  { group: "satellite", label: "卫视", count: 0 },
  { group: "local", label: "地方", count: 0 },
  { group: "hk_mo_tw", label: "港澳台", count: 0 },
];

const PREVIEW_GROUPS: LiveGroupCount[] = [
  { group: "cctv", label: "央视", count: 12 },
  { group: "satellite", label: "卫视", count: 24 },
  { group: "local", label: "地方", count: 36 },
  { group: "hk_mo_tw", label: "港澳台", count: 8 },
];

const PREVIEW_CHANNELS: LiveChannel[] = Array.from({ length: 9 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    channelId: `preview-${n}`,
    name: `频道 ${n}`,
    group: "cctv",
    logo: null,
    source: "preview",
    streamCount: 2,
    updatedAt: new Date().toISOString(),
  };
});

function previewEpg(channelId: string): LiveEpgResponse {
  // 课程表窗口从「现在」往前取 30–60 分钟，当前节目要盖住左端，行内才没有空白
  const now = Date.now();
  const current: LiveProgramme = {
    title: "节目占位 · 正在播",
    description: null,
    startAt: new Date(now - 50 * 60_000).toISOString(),
    stopAt: new Date(now + 10 * 60_000).toISOString(),
  };
  const upcoming: LiveProgramme[] = [];
  let cursor = now + 10 * 60_000;
  for (let i = 0; i < 14; i++) {
    // 30 / 50 / 70 分钟交替，课程表里能看到不同宽度的节目块
    const span = (30 + (i % 3) * 20) * 60_000;
    upcoming.push({
      title: `节目占位 · 下一档 ${String(i + 1).padStart(2, "0")}`,
      description: null,
      startAt: new Date(cursor).toISOString(),
      stopAt: new Date(cursor + span).toISOString(),
    });
    cursor += span;
  }
  return {
    channelId,
    matched: true,
    current,
    upcoming,
    count: upcoming.length + 1,
    fetchedAt: new Date().toISOString(),
  };
}

/** 课程表一次预热的频道行数：第一屏可见 + 一屏滚动余量。 */
const GUIDE_ROWS = 12;
/** 课程表每行请求的节目条数，约覆盖 6–10 小时。 */
const GUIDE_EPG_LIMIT = 20;

interface PreviewState {
  groups: LiveGroupCount[];
  channels: LiveChannel[];
  selectedId: string | null;
  epgBoard: Record<string, LiveEpgResponse>;
  currentById: Record<string, LiveProgramme | null>;
}

function previewState(): PreviewState {
  const selectedId = PREVIEW_CHANNELS[0].channelId;
  const epgBoard = Object.fromEntries(
    PREVIEW_CHANNELS.map((item) => [item.channelId, previewEpg(item.channelId)]),
  );
  return {
    groups: PREVIEW_GROUPS,
    channels: PREVIEW_CHANNELS,
    selectedId,
    epgBoard,
    currentById: Object.fromEntries(
      PREVIEW_CHANNELS.map((item) => [item.channelId, { ...previewEpg(item.channelId).current! }]),
    ),
  };
}

export type LivePreviewMode = "preview" | "empty" | "loading";

export interface LivePageState {
  state: ConnState;
  message: string | null;
  groups: LiveGroupCount[];
  group: string;
  channels: LiveChannel[];
  selectedId: string | null;
  selected: LiveChannel | null;
  currentById: Record<string, LiveProgramme | null>;
  epg: LiveEpgResponse | null;
  /** 课程表数据：channelId → 该频道节目单（还没取到的频道不在表内） */
  epgBoard: Record<string, LiveEpgResponse>;
  /** 课程表行进入视口时按需补节目单 */
  loadEpg: (channelId: string) => void;
  selectGroup: (group: string) => void;
  selectChannel: (channelId: string) => void;
  reload: () => void;
}

/**
 * 直播页唯一数据入口：分组 / 频道 / 节目单都来自 openapi。
 * 课程表按频道行预热前 GUIDE_ROWS 个频道的节目单，选中频道直接复用同一份缓存。
 */
export function useLivePage(preview: LivePreviewMode | false = false): LivePageState {
  const previewData = preview === "preview" ? previewState() : null;
  const [groups, setGroups] = useState<LiveGroupCount[]>(
    preview === "empty" ? PREVIEW_GROUPS : (previewData?.groups ?? GROUP_FALLBACK),
  );
  const [group, setGroup] = useState("cctv");
  const [channels, setChannels] = useState<LiveChannel[]>(previewData?.channels ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(previewData?.selectedId ?? null);
  const [state, setState] = useState<ConnState>(
    preview === "empty" ? "empty" : preview === "loading" ? "loading" : preview ? "ok" : "loading",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [epgBoard, setEpgBoard] = useState<Record<string, LiveEpgResponse>>(
    previewData?.epgBoard ?? {},
  );
  const boardRef = useRef<Record<string, LiveEpgResponse>>(epgBoard);
  const requestedRef = useRef<Set<string>>(new Set());
  const generationRef = useRef(0);
  const [currentById, setCurrentById] = useState<Record<string, LiveProgramme | null>>(
    previewData?.currentById ?? {},
  );
  const [reloadKey, setReloadKey] = useState(0);

  const putEpg = useCallback((channelId: string, next: LiveEpgResponse) => {
    boardRef.current = { ...boardRef.current, [channelId]: next };
    setEpgBoard(boardRef.current);
  }, []);

  /** 课程表行按需取节目单：同一频道只请求一次，切分组后旧响应丢弃。 */
  const loadEpg = useCallback(
    (channelId: string) => {
      if (preview || !channelId || requestedRef.current.has(channelId)) return;
      requestedRef.current.add(channelId);
      const generation = generationRef.current;
      void api
        .liveEpg(channelId, GUIDE_EPG_LIMIT)
        .then((next) => {
          if (generation === generationRef.current) putEpg(channelId, next);
        })
        .catch(() => {
          if (generation !== generationRef.current) return;
          putEpg(channelId, {
            channelId,
            matched: false,
            current: null,
            upcoming: [],
            count: 0,
          });
        });
    },
    [preview, putEpg],
  );

  const clearEpg = useCallback(() => {
    generationRef.current += 1;
    boardRef.current = {};
    requestedRef.current.clear();
    setEpgBoard({});
  }, []);

  useEffect(() => {
    if (!preview) return;
    if (preview === "loading") {
      setGroups(GROUP_FALLBACK);
      setChannels([]);
      setSelectedId(null);
      clearEpg();
      setCurrentById({});
      setState("loading");
      setMessage(null);
      return;
    }
    if (preview === "empty") {
      setGroups(PREVIEW_GROUPS);
      setChannels([]);
      setSelectedId(null);
      clearEpg();
      setCurrentById({});
      setState("empty");
      setMessage(null);
      return;
    }
    const next = previewState();
    setGroups(next.groups);
    setChannels(next.channels);
    setSelectedId(next.selectedId);
    boardRef.current = next.epgBoard;
    requestedRef.current.clear();
    setEpgBoard(next.epgBoard);
    setCurrentById(next.currentById);
    setState("ok");
    setMessage(null);
  }, [preview, reloadKey, clearEpg]);

  useEffect(() => {
    if (preview) return;
    let alive = true;
    setState("loading");
    setMessage(null);
    clearEpg();

    void (async () => {
      try {
        const [groupPage, channelPage] = await Promise.all([
          api.liveGroups().catch(() => null),
          api.liveChannels({ group, limit: 60 }),
        ]);
        if (!alive) return;
        if (groupPage?.items.length) setGroups(groupPage.items);
        const items = channelPage.items ?? [];
        setChannels(items);
        setSelectedId((current) =>
          current && items.some((item) => item.channelId === current)
            ? current
            : (items[0]?.channelId ?? null),
        );
        setState(items.length ? "ok" : "empty");
      } catch (error) {
        if (!alive) return;
        setChannels([]);
        setSelectedId(null);
        setCurrentById({});
        const next = describe(error);
        setState(next.state);
        setMessage(next.message);
      }
    })();

    return () => {
      alive = false;
    };
  }, [group, preview, reloadKey, clearEpg]);

  /** 课程表首屏预热：前 GUIDE_ROWS 个频道先取，其余行滚动到视口内再补。 */
  useEffect(() => {
    if (preview || !channels.length) return;
    channels.slice(0, GUIDE_ROWS).forEach((item) => loadEpg(item.channelId));
  }, [channels, preview, loadEpg]);

  /** 选中频道（列表靠后、课程表还没预热到的）也要有节目单。 */
  useEffect(() => {
    if (preview || !selectedId) return;
    loadEpg(selectedId);
  }, [preview, selectedId, loadEpg]);

  /** 课程表 → 频道列表：把每行已取到的「正在播」同步给左侧列表。 */
  useEffect(() => {
    setCurrentById((current) => {
      let changed = false;
      const next = { ...current };
      for (const [channelId, item] of Object.entries(epgBoard)) {
        if (next[channelId] !== item.current) {
          next[channelId] = item.current;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [epgBoard]);

  const selectGroup = useCallback(
    (next: string) => {
      setGroup(next);
      clearEpg();
    },
    [clearEpg],
  );

  const selectChannel = useCallback((channelId: string) => {
    setSelectedId(channelId);
  }, []);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const selected = channels.find((item) => item.channelId === selectedId) ?? null;
  const epg = selectedId ? (epgBoard[selectedId] ?? null) : null;

  return {
    state,
    message,
    groups,
    group,
    channels,
    selectedId,
    selected,
    currentById,
    epg,
    epgBoard,
    loadEpg,
    selectGroup,
    selectChannel,
    reload,
  };
}
