import { useCallback, useEffect, useRef, useState } from "react";
import { api, posterUrl, type FavoriteItem, type RecommendItem, type RecommendSourceName } from "../data/api";
import { describe } from "../data/home";
import type { LibrarySnapshot, MediaCardData, MediaRowData } from "../types";

export type LibraryKind = "recommend" | "movie" | "tv" | "anime" | "favorites";

const ROW_SIZE = 7;
const CARD_POSTER_WIDTH = 400;

/** 每行对应的后端推荐源与翻页状态；无来源的行（收藏）不翻页。 */
interface RowPager {
  source: RecommendSourceName;
  page: number;
  loading: boolean;
  done: boolean;
}

function card(id: string, title: string, meta: string | null, poster: string | null, rating: number | null, local: boolean): MediaCardData {
  return { id, title, meta, poster, rating, local };
}

function metaOf(year: number | null, extra?: string | null): string | null {
  return [year ? String(year) : null, extra ?? null].filter(Boolean).join(" · ") || null;
}

function fromRecommend(item: RecommendItem): MediaCardData {
  const poster = item.poster ?? (item.mediaId ? posterUrl(item.mediaId, CARD_POSTER_WIDTH) : null);
  return card(item.mediaId ?? item.title, item.title, metaOf(item.year), poster, item.rating, Boolean(item.mediaId));
}

function fromFavorite(item: FavoriteItem): MediaCardData {
  const poster = item.itemType === "media" ? posterUrl(item.itemId, CARD_POSTER_WIDTH) : null;
  return card(`${item.itemType}:${item.itemId}`, item.titleSnapshot, null, poster, null, item.itemType === "media");
}

/** 行标题 → 后端推荐源：卡组往右翻页时按同一来源取下一页。 */
interface LoadedLibrary {
  snapshot: LibrarySnapshot;
  sources: Record<string, RecommendSourceName>;
}

async function recommendRow(title: string, source: RecommendSourceName): Promise<MediaRowData> {
  const page = await api.recommend(source, 1, ROW_SIZE);
  return { title, items: (page.items ?? []).map(fromRecommend) };
}

function groupFavorites(items: FavoriteItem[]): MediaRowData[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const today: FavoriteItem[] = [];
  const week: FavoriteItem[] = [];
  const older: FavoriteItem[] = [];
  for (const item of items) {
    const at = new Date(item.createdAt).getTime();
    if (!Number.isFinite(at)) {
      older.push(item);
    } else if (at >= start.getTime()) {
      today.push(item);
    } else if (now - at <= 7 * day) {
      week.push(item);
    } else {
      older.push(item);
    }
  }
  return [
    { title: "今天", items: today.map(fromFavorite) },
    { title: "本周", items: week.map(fromFavorite) },
    { title: "更早", items: older.map(fromFavorite) },
  ].filter((row) => row.items.length > 0);
}

async function fetchLibrary(kind: LibraryKind): Promise<LoadedLibrary> {
  const sources = await api
    .recommendSources()
    .then((res) => res.sources ?? [])
    .catch(() => []);
  const tags = sources
    .filter((source) => source.name && source.label)
    .map((source) => ({ key: source.name, label: source.label }));

  if (kind === "favorites") {
    const page = await api.favorites(0, 60);
    const rows = groupFavorites(page.items ?? []);
    return {
      snapshot: {
        state: rows.length ? "ok" : "empty",
        message: null,
        hero: null,
        rows,
        tags: [],
      },
      sources: {},
    };
  }

  if (kind === "recommend") {
    const [showing, movie, anime, tv] = await Promise.all([
      recommendRow("猜你喜欢", "showing"),
      recommendRow("电影", "movie_hot"),
      recommendRow("动漫", "anime"),
      recommendRow("电视剧", "tv_hot"),
    ]);
    const rows = [showing, movie, anime, tv];
    const heroItem = showing.items[0] ?? movie.items[0] ?? null;
    const filled = rows.filter((row) => row.items.length > 0);
    return {
      snapshot: {
        state: filled.length ? "ok" : "empty",
        message: null,
        hero: heroItem,
        rows: filled,
        tags: tags.slice(0, 4),
      },
      sources: {
        猜你喜欢: "showing",
        电影: "movie_hot",
        动漫: "anime",
        电视剧: "tv_hot",
      },
    };
  }

  const plan =
    kind === "movie"
      ? ([
          ["正在热映", "showing"],
          ["热门电影", "movie_hot"],
        ] as const)
      : kind === "tv"
        ? ([
            ["热门剧集", "tv_hot"],
            ["高分剧集", "top250"],
          ] as const)
        : ([
            ["动画剧集", "anime"],
            ["高分动画", "top250"],
          ] as const);
  const rows = await Promise.all(plan.map(([title, source]) => recommendRow(title, source)));
  const filled = rows.filter((row) => row.items.length > 0);
  return {
    snapshot: {
      state: filled.length ? "ok" : "empty",
      message: null,
      hero: null,
      rows: filled,
      tags: tags.slice(0, kind === "tv" ? 5 : kind === "anime" ? 4 : 3),
    },
    sources: Object.fromEntries(plan),
  };
}

/** 分类标签切换后只取该 source 的一行卡片。 */
export async function fetchSourceCards(source: string): Promise<MediaCardData[]> {
  const page = await api.recommend(source as Parameters<typeof api.recommend>[0], 1, 14);
  return (page.items ?? []).map(fromRecommend);
}

/**
 * 媒体库页取数：结构按 openapi 写好，失败/401/空都不造假数据，
 * 由页面按 state 显示骨架屏、空态或未连接态。
 */
export function useLibraryPage(kind: LibraryKind) {
  const [snapshot, setSnapshot] = useState<LibrarySnapshot>({
    state: "loading",
    message: null,
    hero: null,
    rows: [],
    tags: [],
  });
  const pagers = useRef<Record<string, RowPager>>({});

  const load = useCallback(() => {
    setSnapshot((current) => ({ ...current, state: "loading", message: null }));
    void fetchLibrary(kind)
      .then(({ snapshot: next, sources }) => {
        const counts = new Map(next.rows.map((row) => [row.title, row.items.length]));
        pagers.current = Object.fromEntries(
          Object.entries(sources).map(([title, source]) => [
            title,
            {
              source,
              page: 1,
              loading: false,
              // 首屏不足一页说明该来源已到底，不再请求下一页
              done: (counts.get(title) ?? 0) < ROW_SIZE,
            },
          ]),
        );
        setSnapshot(next);
      })
      .catch((error: unknown) => {
        pagers.current = {};
        const { state, message } = describe(error);
        setSnapshot({ state, message, hero: null, rows: [], tags: [] });
      });
  }, [kind]);

  /** 焦点走到行尾时追加下一页：卡组往右可以一直翻，直到来源取空。 */
  const loadMore = useCallback((title: string) => {
    const pager = pagers.current[title];
    if (!pager || pager.loading || pager.done) return;
    pager.loading = true;
    const page = pager.page + 1;
    api
      .recommend(pager.source, page, ROW_SIZE)
      .then((res) => {
        const items = (res.items ?? []).map(fromRecommend);
        pager.page = page;
        pager.done = items.length < ROW_SIZE;
        if (!items.length) return;
        setSnapshot((current) => ({
          ...current,
          rows: current.rows.map((row) => {
            if (row.title !== title) return row;
            const seen = new Set(row.items.map((item) => item.id));
            return { ...row, items: [...row.items, ...items.filter((item) => !seen.has(item.id))] };
          }),
        }));
      })
      .catch(() => {
        // 翻页失败不打断浏览：停在已加载的卡片上，连接态由页面统一提示
        pager.done = true;
      })
      .finally(() => {
        pager.loading = false;
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { snapshot, reload: load, loadMore };
}
