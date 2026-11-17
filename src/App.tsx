import { useCallback, useState } from "react";
import { Shell } from "./components/Shell";
import type { RouteName } from "./data/navigation";
import { useScreenProfile } from "./lib/scale";
import { DetailPage, type DetailVariant } from "./pages/DetailPage";
import { DevPreviewPage } from "./pages/DevPreviewPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { LivePage } from "./pages/LivePage";
import { MusicPage } from "./pages/MusicPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { PlayerPage } from "./pages/PlayerPage";
import { SaverPreviewPage } from "./pages/SaverPreviewPage";
import { SettingsPage, type SettingsGroup } from "./pages/SettingsPage";
import { SubscribePage, type SubscribeView } from "./pages/SubscribePage";
import type { MediaCardData } from "./types";

const LIBRARY_ROUTES = new Set<RouteName>([
  "recommend",
  "movie",
  "tv",
  "anime",
  "favorites",
  "search",
]);

const DETAIL_VARIANTS: DetailVariant[] = ["movie", "tv", "anime", "unseen", "watched", "online", "sources"];
const SUBSCRIBE_VIEWS: SubscribeView[] = ["list", "movie", "tv", "anime"];
const SETTINGS_GROUPS: SettingsGroup[] = [
  "play",
  "danmaku",
  "network",
  "appearance",
  "power",
  "security",
  "status",
  "about",
  "dev",
  "subtitle",
  "source",
];

/** 预览直链：`?page=detail&state=tv`，只用于开发核对，不进入应用路由。 */
function PreviewStage() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");
  const state = params.get("state");

  if (page === "detail") {
    const variant = DETAIL_VARIANTS.includes(state as DetailVariant) ? (state as DetailVariant) : "movie";
    return <DetailPage variant={variant} />;
  }
  if (page === "subscribe") {
    const view = SUBSCRIBE_VIEWS.includes(state as SubscribeView) ? (state as SubscribeView) : "list";
    return (
      <SubscribePage
        view={view}
        downloadOpen={params.get("download") === "1"}
      />
    );
  }
  if (page === "settings") {
    const group = SETTINGS_GROUPS.includes(state as SettingsGroup) ? (state as SettingsGroup) : "play";
    return <SettingsPage group={group} />;
  }
  if (page === "live") {
    const preview = state === "preview" || state === "empty" || state === "loading" ? state : undefined;
    return <LivePage preview={preview} />;
  }
  if (page === "music") {
    const preview = state === "placeholder" ? "placeholder" : state === "empty" ? "empty" : undefined;
    return <MusicPage preview={preview} onBack={() => { window.location.href = "/"; }} />;
  }
  if (page === "screensaver") return <SaverPreviewPage />;
  if (page === "player") return <PlayerPage />;
  return null;
}

export default function App() {
  useScreenProfile();
  const [route, setRoute] = useState<RouteName>("home");
  const [lastShelf, setLastShelf] = useState<RouteName>("recommend");
  const [selected, setSelected] = useState<MediaCardData | null>(null);
  const [subView, setSubView] = useState<SubscribeView>("list");

  const navigate = useCallback((next: RouteName) => {
    if (LIBRARY_ROUTES.has(next)) setLastShelf(next);
    if (next === "subscribe") setSubView("list");
    setRoute(next);
  }, []);

  const openDetail = useCallback((card: MediaCardData | null) => {
    setSelected(card);
    setRoute("detail");
  }, []);

  const back = useCallback(() => {
    if (route === "player") {
      setRoute("detail");
      return;
    }
    if (route === "detail") {
      setRoute(lastShelf);
      return;
    }
    if (route === "subscribe" && subView !== "list") {
      setSubView("list");
      return;
    }
    setRoute("home");
  }, [lastShelf, route, subView]);

  if (new URLSearchParams(window.location.search).get("dev") === "1") {
    return <DevPreviewPage />;
  }

  if (new URLSearchParams(window.location.search).get("page")) {
    return <PreviewStage />;
  }

  const page =
    route === "home" ? (
      <HomePage onNavigate={navigate} />
    ) : LIBRARY_ROUTES.has(route) ? (
      <LibraryPage route={route} onOpen={openDetail} />
    ) : route === "detail" ? (
      <DetailPage card={selected} onPlay={() => setRoute("player")} />
    ) : route === "player" ? (
      <PlayerPage onBack={back} />
    ) : route === "live" ? (
      <LivePage />
    ) : route === "music" ? (
      <MusicPage onBack={back} />
    ) : route === "subscribe" ? (
      <SubscribePage
        view={subView}
        onOpen={() => setSubView("movie")}
        onPlay={() => setRoute("player")}
      />
    ) : route === "settings" ? (
      <SettingsPage />
    ) : (
      <PlaceholderPage route={route} />
    );

  return (
    <Shell route={route} onNavigate={navigate} onBack={back}>
      {page}
    </Shell>
  );
}
