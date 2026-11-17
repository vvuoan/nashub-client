import { useCallback, useEffect, useRef, useState } from "react";
import { Backdrop } from "../components/media/Backdrop";
import { ClockBox } from "../components/media/ClockBox";
import { ConnectionNotice } from "../components/media/ConnectionNotice";
import { ContinueWatchingRow } from "../components/media/ContinueWatchingRow";
import { CornerButton } from "../components/media/CornerButton";
import { Cue } from "../components/media/Overlays";
import { Saver } from "../components/media/Saver";
import { EntryShelf } from "../components/media/EntryShelf";
import { WallpaperPanel } from "../components/media/WallpaperPanel";
import { initialHomeData, loadHomeData } from "../data/home";
import { routeForTile, type RouteName } from "../data/navigation";
import { useClock } from "../hooks/useClock";
import { useHomeOverview } from "../hooks/useHomeOverview";
import { useIdleSaver } from "../hooks/useIdleSaver";
import { useRemoteKeys } from "../hooks/useRemoteKeys";
import { useWallpaper } from "../hooks/useWallpaper";
import type { HomeSnapshot, WallSource } from "../types";

interface HomePageProps {
  onNavigate: (route: RouteName) => void;
}

function firstTile(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".tiles .tile");
}

export function HomePage({ onNavigate }: HomePageProps) {
  const clock = useClock();
  const overview = useHomeOverview();
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(() => ({
    data: initialHomeData(),
    state: "loading",
    message: null,
  }));
  const [contOpen, setContOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const saverFocus = useRef<HTMLElement | null>(null);
  const wasSaver = useRef(false);

  const { saverOn, exitSaver, resetIdle } = useIdleSaver(contOpen || sheetOpen);
  const wall = useWallpaper(snapshot.data, saverOn || contOpen || sheetOpen);

  const load = useCallback(() => {
    setSnapshot((current) => ({ ...current, state: "loading", message: null }));
    void loadHomeData().then(setSnapshot);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCont = useCallback(() => {
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setContOpen(true);
  }, []);

  const closeCont = useCallback(() => {
    setContOpen(false);
    window.requestAnimationFrame(() => {
      (returnFocus.current ?? firstTile())?.focus();
    });
  }, []);

  const openSheet = useCallback(() => setSheetOpen(true), []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    window.requestAnimationFrame(() => {
      const opener = document.querySelector<HTMLElement>('[data-focus-key="wall:open"]');
      (opener ?? firstTile())?.focus();
    });
  }, []);

  const chooseSource = useCallback(
    (source: WallSource) => {
      wall.changeSource(source);
    },
    [wall],
  );

  const chooseWallpaper = useCallback(
    (index: number) => {
      wall.pick(index);
      setSheetOpen(false);
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-focus-key="wall:open"]')?.focus();
      });
    },
    [wall],
  );

  const selectTile = useCallback(
    (id: string) => {
      onNavigate(routeForTile(id));
    },
    [onNavigate],
  );

  useEffect(() => {
    document.body.classList.toggle("cont-open", contOpen);
    if (contOpen) {
      window.requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(".ccards .ccard")?.focus(),
      );
    }
  }, [contOpen]);

  useEffect(() => {
    if (sheetOpen) {
      window.requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(".srcs button")?.focus(),
      );
    }
  }, [sheetOpen]);

  useEffect(() => {
    if (saverOn) {
      saverFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.body.classList.add("saver");
    } else {
      document.body.classList.remove("saver");
      if (wasSaver.current) {
        const target = saverFocus.current ?? firstTile();
        window.requestAnimationFrame(() => target?.focus());
      }
    }
    wasSaver.current = saverOn;
  }, [saverOn]);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => firstTile()?.focus());
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useRemoteKeys({
    saverOn,
    sheetOpen,
    contOpen,
    onExitSaver: exitSaver,
    onCloseSheet: closeSheet,
    onCloseCont: closeCont,
    onOpenCont: openCont,
    onActivity: resetIdle,
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--dim", wall.dim.toFixed(2));
  }, [wall.dim]);

  const black = wall.source === "black" || wall.wallUrl === null;
  const lunar = overview?.lunar.display ?? null;
  const weather =
    overview && overview.weather.temperature !== null
      ? `${overview.weather.temperature}°${overview.weather.condition ? ` · ${overview.weather.condition}` : ""}`
      : null;

  return (
    <>
      <Backdrop url={wall.wallUrl} black={black} />
      <main className="home">
        <ClockBox date={clock.date} time={clock.time} lunar={lunar} weather={weather} />
        <ConnectionNotice state={snapshot.state} message={snapshot.message} onRetry={load} />
        <CornerButton onClick={openSheet} />
        <ContinueWatchingRow open={contOpen} items={snapshot.data.continueItems} />
        <Cue visible={snapshot.data.continueItems.length > 0} count={snapshot.data.continueItems.length} />
        <EntryShelf tiles={snapshot.data.tiles} onSelect={selectTile} />
        <Saver on={saverOn} time={clock.saverTime} date={clock.saverDate} />
        <WallpaperPanel
          open={sheetOpen}
          source={wall.source}
          thumbs={wall.thumbs}
          current={wall.current}
          onSource={chooseSource}
          onPick={chooseWallpaper}
          onClose={closeSheet}
        />
      </main>
    </>
  );
}
