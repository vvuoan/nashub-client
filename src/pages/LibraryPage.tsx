import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { ConnState, MediaCardData, MediaRowData } from "../types";
import type { RouteName } from "../data/navigation";
import { CardRow } from "../components/media/CardRow";
import { CategoryTabs } from "../components/media/CategoryTabs";
import { ConnectionNotice } from "../components/media/ConnectionNotice";
import { FilterPanel } from "../components/media/FilterPanel";
import { KeyPad } from "../components/media/KeyPad";
import { LibraryHero } from "../components/media/LibraryHero";
import { MediaCard } from "../components/media/MediaCard";
import { fetchSourceCards, useLibraryPage, type LibraryKind } from "../hooks/useLibraryPage";
import { useCatalogSearch } from "../hooks/useCatalogSearch";

const SKELETON_TITLES: Record<LibraryKind, string[]> = {
  recommend: ["猜你喜欢", "电影", "动漫", "电视剧"],
  movie: ["正在热映", "热门电影"],
  tv: ["热门剧集", "高分剧集"],
  anime: ["动画剧集", "高分动画"],
  favorites: ["今天", "本周"],
};

const HERO_KINDS: LibraryKind[] = ["recommend"];

/** 无 tag 数据时保留的画布标签骨架数量 */
const SKELETON_TABS: Record<LibraryKind, number> = {
  recommend: 0,
  movie: 3,
  tv: 5,
  anime: 4,
  favorites: 4,
};

interface LibraryPageProps {
  route: RouteName;
  onOpen?: (card: MediaCardData | null) => void;
}

/** 影视族入口：推荐/电影/电视剧/动漫/收藏/搜索共用外壳，页面只做组合与布局。 */
export function LibraryPage({ route, onOpen }: LibraryPageProps) {
  if (route === "search") return <SearchView onOpen={onOpen} />;
  return <ShelfView kind={route as LibraryKind} onOpen={onOpen} />;
}

/* ---------------- 影视 / 电影 / 电视剧 / 动漫 / 收藏 ---------------- */

function ShelfView({ kind, onOpen }: { kind: LibraryKind; onOpen?: (card: MediaCardData | null) => void }) {
  const { snapshot, reload, loadMore } = useLibraryPage(kind);
  const [mode, setMode] = useState<"hero" | "list">("hero");
  const [tagKey, setTagKey] = useState<string | null>(null);
  const [tagCards, setTagCards] = useState<MediaCardData[] | null>(null);
  const [tagState, setTagState] = useState<ConnState>("loading");
  const [filterOpen, setFilterOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [rowsScrolled, setRowsScrolled] = useState(false);
  const rowsRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | null>(null);

  const isHero = HERO_KINDS.includes(kind);
  const loading = snapshot.state === "loading";

  const showToast = useCallback((text: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  useEffect(() => {
    setMode("hero");
    setTagKey(null);
    setFilterOpen(false);
  }, [kind]);

  // 回到首屏时把海报墙平滑归位，避免停在半途
  useEffect(() => {
    if (mode === "hero") rowsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [mode]);

  useEffect(() => {
    if (!tagKey) {
      setTagCards(null);
      return;
    }
    let alive = true;
    setTagState("loading");
    fetchSourceCards(tagKey)
      .then((cards) => {
        if (!alive) return;
        setTagCards(cards);
        setTagState(cards.length ? "ok" : "empty");
      })
      .catch(() => {
        if (!alive) return;
        setTagCards([]);
        setTagState("error");
      });
    return () => {
      alive = false;
    };
  }, [tagKey]);

  const enterList = useCallback(() => {
    if (isHero) setMode("list");
  }, [isHero]);

  const backToHero = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (!isHero || mode !== "list" || event.key !== "ArrowUp") return;
      const active = document.activeElement as HTMLElement | null;
      if (!active || !rowsRef.current?.contains(active)) return;
      const row = active.closest(".crow");
      if (row !== rowsRef.current.querySelector(".crow")) return;
      event.preventDefault();
      event.stopPropagation();
      setMode("hero");
      window.requestAnimationFrame(() => {
        const play = document.querySelector<HTMLElement>('[data-focus-key="hero:play"]');
        if (play && !play.hasAttribute("disabled")) {
          play.focus();
          return;
        }
        const detail = document.querySelector<HTMLElement>('[data-focus-key="hero:detail"]');
        if (detail && !detail.hasAttribute("disabled")) {
          detail.focus();
          return;
        }
        // 没有可播放条目时回到当前导航项，导航随之展开。
        document.querySelector<HTMLElement>(`.navrail [data-focus-key="nav:${kind}"]`)?.focus();
      });
    },
    [isHero, kind, mode],
  );

  const rows: MediaRowData[] = snapshot.rows.length
    ? snapshot.rows
    : SKELETON_TITLES[kind].map((title) => ({ title, items: [] }));

  const tagLabel = snapshot.tags.find((tag) => tag.key === tagKey)?.label ?? null;
  const tagRow: MediaRowData | null = tagCards
    ? { title: tagLabel ?? "分类", items: tagCards }
    : null;

  return (
    <section
      className={`lib lib-${kind} ${isHero && mode === "list" ? "list-mode" : "hero-mode"}`}
      onKeyDown={backToHero}
    >
      {isHero ? (
        <LibraryHero
          hero={snapshot.hero}
          mode={mode}
          loading={loading}
          onPlay={() => showToast("播放页将在后续阶段接入")}
          onDetail={() => {
            if (snapshot.hero) onOpen?.(snapshot.hero);
            else showToast(loading ? "内容加载中，请稍候" : "暂无可打开的内容");
          }}
        />
      ) : (
        <CategoryTabs
          tags={snapshot.tags}
          active={tagKey}
          showFilter={kind !== "favorites"}
          skeletonCount={SKELETON_TABS[kind]}
          onSelect={(key) => setTagKey((current) => (current === key ? null : key))}
          onFocusSelect={(key) => setTagKey(key)}
          onFilter={() => setFilterOpen(true)}
        />
      )}

      {tagRow ? (
        <div className="tagview">
          <CardRow row={tagRow} skeleton={tagState === "loading" ? 7 : 0} onCard={onOpen} onEmpty={() => onOpen?.(null)} />
          {tagState === "error" && <p className="tagview-note">分类内容加载失败，请稍后重试。</p>}
          {tagState === "empty" && <p className="tagview-note">该分类暂无内容。</p>}
        </div>
      ) : (
        <div
          className={rowsScrolled ? "rows is-scrolled" : "rows"}
          ref={rowsRef}
          onFocusCapture={enterList}
          onScroll={(event) => setRowsScrolled(event.currentTarget.scrollTop > 4)}
        >
          {rows.map((row) => (
            <CardRow
              key={row.title}
              row={row}
              skeleton={loading ? 7 : 0}
              showTitle={isHero || kind === "favorites"}
              onCard={onOpen}
              onEmpty={() => onOpen?.(null)}
              onMore={() => loadMore(row.title)}
            />
          ))}
        </div>
      )}

      {snapshot.state !== "empty" && (
        <ConnectionNotice state={snapshot.state} message={snapshot.message} onRetry={reload} />
      )}
      {toast && <p className="lib-toast">{toast}</p>}
      <FilterPanel
        open={filterOpen}
        groups={[
          { label: "类型", options: snapshot.tags.map((tag) => tag.label) },
          { label: "国家", options: [] },
        ]}
        onClose={() => setFilterOpen(false)}
      />
    </section>
  );
}

/* ---------------- 搜索 ---------------- */

function SearchView({ onOpen }: { onOpen?: (card: MediaCardData | null) => void }) {
  const search = useCatalogSearch();

  const append = useCallback(
    (char: string) => search.setQuery((current) => `${current}${char}`),
    [search],
  );
  const backspace = useCallback(
    () => search.setQuery((current) => current.slice(0, -1)),
    [search],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Backspace") {
        if (!search.query) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        backspace();
        return;
      }
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        append(" ");
        return;
      }
      if (event.key.length === 1 && /[\w\u4e00-\u9fa5-]/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        append(event.key);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [append, backspace, search.query]);

  const loading = search.state === "loading";

  /**
   * 搜索页的导航栏在左侧，几何上比键盘/结果更「近」时会抢走焦点并触发切页。
   * 纵向移动只在键盘与结果之间走：键盘最后一行 ↓ 进结果首项，键盘首行 ↑ 留在键盘。
   */
  const onSearchKeys = (event: ReactKeyboardEvent<HTMLElement>) => {
    const active = document.activeElement as HTMLElement | null;
    if (!active || !active.closest(".keypad")) return;
    const midY = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return rect.top + rect.height / 2;
    };
    const y = midY(active);
    const keys = Array.from(document.querySelectorAll<HTMLElement>(".keypad [data-nav]"));

    if (event.key === "ArrowDown") {
      if (keys.some((el) => midY(el) > y + 8)) return;
      event.preventDefault();
      event.stopPropagation();
      document.querySelector<HTMLElement>(".sresults [data-nav]")?.focus();
      return;
    }
    if (event.key === "ArrowUp") {
      if (keys.some((el) => midY(el) < y - 8)) return;
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const cards = loading
    ? Array.from({ length: 8 }, (_, index) => <span key={`sk-${index}`} className="card-skel" aria-hidden="true" />)
    : search.items.length
      ? search.items.map((item) => (
          <MediaCard key={item.id} data={item} onSelect={() => onOpen?.(item)} />
        ))
      : Array.from({ length: 8 }, (_, index) => (
          <MediaCard key={`ph-${index}`} data={null} focusKey={`search-ph:${index}`} onSelect={() => onOpen?.(null)} />
        ));

  return (
    <section className="lib lib-search" onKeyDown={onSearchKeys}>
      <div className="sinput" role="search">
        <span className="sinput-text">{search.query}</span>
        <span className="sinput-caret" aria-hidden="true" />
      </div>
      <h2 className="sresult-t">
        搜索结果 · {search.total} 部
        {search.state === "empty" && search.query ? " · 暂无匹配" : ""}
      </h2>
      <KeyPad
        onKey={append}
        onSpace={() => append(" ")}
        onDelete={backspace}
        onClear={() => search.setQuery("")}
        onSearch={() => undefined}
      />
      <div className="sresults">
        <div className="sresult-grid">{cards}</div>
      </div>
      {search.state !== "empty" && (
        <ConnectionNotice state={search.state} message={search.message} onRetry={search.retry} />
      )}
    </section>
  );
}
