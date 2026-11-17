import { useState, type ReactNode } from "react";
import { Button } from "../components/base/Button";
import { FocusScope } from "../components/base/FocusScope";
import { Focusable } from "../components/base/Focusable";
import { IconButton } from "../components/base/IconButton";
import { MetaField } from "../components/base/MetaField";
import { NavIcon } from "../components/base/NavIcon";
import { Placeholder } from "../components/base/Placeholder";
import { PosterImage } from "../components/base/PosterImage";
import { ProgressBar } from "../components/base/ProgressBar";
import { Segmented } from "../components/base/Segmented";
import { Select } from "../components/base/Select";
import { Skeleton } from "../components/base/Skeleton";
import { Slider } from "../components/base/Slider";
import { StatusChip } from "../components/base/StatusChip";
import { Stepper } from "../components/base/Stepper";
import { Switch } from "../components/base/Switch";
import { CardRow } from "../components/media/CardRow";
import { CastCard } from "../components/media/CastCard";
import { CategoryTabs } from "../components/media/CategoryTabs";
import { ClockBox } from "../components/media/ClockBox";
import { ConnectionNotice } from "../components/media/ConnectionNotice";
import { ContinueWatchingRow } from "../components/media/ContinueWatchingRow";
import { CornerButton } from "../components/media/CornerButton";
import { DownloadCard } from "../components/media/DownloadCard";
import { EntryShelf } from "../components/media/EntryShelf";
import { EpisodeCard } from "../components/media/EpisodeCard";
import { EpisodeList } from "../components/media/EpisodeList";
import { FilterPanel } from "../components/media/FilterPanel";
import { KeyPad } from "../components/media/KeyPad";
import { MediaCard } from "../components/media/MediaCard";
import { NavEdgeTab } from "../components/media/NavEdgeTab";
import { NavRail } from "../components/media/NavRail";
import { PlayerControls } from "../components/media/PlayerControls";
import { SearchResultItem } from "../components/media/SearchResultItem";
import { SettingItem } from "../components/media/SettingItem";
import { SourceMenu } from "../components/media/SourceMenu";
import { SubtitleMenu } from "../components/media/SubtitleMenu";
import { TrackMenu } from "../components/media/TrackMenu";
import { WallpaperPanel } from "../components/media/WallpaperPanel";
import type { ConnState, MediaCardData, NavTile } from "../types";
import type { RouteName } from "../data/navigation";

const DEMO_CARD: MediaCardData = {
  id: "demo",
  title: "组件示例",
  meta: "结构演示",
  poster: null,
  rating: null,
  local: false,
};

/** 入口磁贴只演示结构与配色，不使用真实入口名称 */
const DEMO_TILES: NavTile[] = [
  { id: "a", name: "入口一", icon: "film", tone: "#2a3440" },
  { id: "b", name: "入口二", icon: "live", tone: "#332a40" },
  { id: "c", name: "入口三", icon: "music", tone: "#2a3a34" },
  { id: "d", name: "入口四", icon: "gear", tone: "#3a302a" },
];

const CONN_STATES: ConnState[] = ["loading", "empty", "unauthorized", "unreachable", "error"];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="dev-section">
      <h2 className="dev-title">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="dev-row">
      <span className="dev-label">{label}</span>
      <div className="dev-items">{children}</div>
    </div>
  );
}

/** 组件资源库预览：`?dev=1` 进入，不受后端影响。 */
export function DevPreviewPage() {
  const [slider, setSlider] = useState(40);
  const [checked, setChecked] = useState(true);
  const [choice, setChoice] = useState("b");
  const [tag, setTag] = useState("a");
  const [episode, setEpisode] = useState("1");
  const [position, setPosition] = useState(420);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [wallOpen, setWallOpen] = useState(false);
  const [navRoute, setNavRoute] = useState<RouteName>("recommend");
  const [seg, setSeg] = useState("b");
  const [count, setCount] = useState(45);
  const [downloadOpen, setDownloadOpen] = useState(true);
  const [sourceOpen, setSourceOpen] = useState(false);

  return (
    <FocusScope name="dev" className="dev" autoFocus>
      <header className="dev-head">
        <h1>组件资源库</h1>
        <p>基础层 / 业务层 / 状态平铺 · 占位卡不包含任何影视信息</p>
      </header>

      <Section title="基础 · 按钮与图标">
        <Row label="Button">
          <Button focusKey="dev:b1">主按钮</Button>
          <Button variant="ghost" focusKey="dev:b2">次按钮</Button>
          <Button disabled>禁用</Button>
          <IconButton label="示例图标" focusKey="dev:ib">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="4" y="5" width="16" height="14" rx="3" />
            </svg>
          </IconButton>
          <IconButton label="禁用图标" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="8" />
            </svg>
          </IconButton>
        </Row>
        <Row label="焦点">
          <Focusable className="btn primary" focusKey="dev:focus">
            可聚焦元素
          </Focusable>
        </Row>
        <Row label="导航图标">
          <span className="dev-icons">
            {(["recommend", "movie", "tv", "anime", "favorites", "search"] as const).map((name) => (
              <NavIcon key={name} name={name} />
            ))}
          </span>
        </Row>
      </Section>

      <Section title="基础 · 控件">
        <Row label="ProgressBar">
          <span className="dev-bar">
            <ProgressBar value={0} label="0" />
          </span>
          <span className="dev-bar">
            <ProgressBar value={45} label="45" />
          </span>
          <span className="dev-bar">
            <ProgressBar value={100} label="100" />
          </span>
        </Row>
        <Row label="Slider">
          <Slider value={slider} label="音量" focusKey="dev:slider" onChange={setSlider} />
        </Row>
        <Row label="Switch">
          <Switch checked={checked} label="开关" focusKey="dev:switch" onChange={setChecked} />
          <Switch checked={false} label="关闭态" focusKey="dev:switch2" onChange={() => undefined} />
        </Row>
        <Row label="Select">
          <Select
            value={choice}
            label="选项"
            focusKey="dev:select"
            options={[
              { value: "a", label: "选项一" },
              { value: "b", label: "选项二" },
              { value: "c", label: "选项三" },
            ]}
            onChange={setChoice}
          />
        </Row>
        <Row label="Segmented">
          <Segmented
            value={seg}
            label="分段选择"
            focusKey="dev:seg"
            options={[
              { value: "a", label: "选项一" },
              { value: "b", label: "选项二" },
              { value: "c", label: "选项三" },
            ]}
            onChange={setSeg}
          />
        </Row>
        <Row label="Stepper">
          <Stepper
            value={`${count} 秒`}
            label="步进器"
            focusKey="dev:step"
            current={count}
            min={0}
            max={120}
            step={5}
            onChange={setCount}
          />
        </Row>
        <Row label="禁用态">
          <Segmented
            value="a"
            label="禁用分段"
            focusKey="dev:seg-dis"
            disabled
            options={[
              { value: "a", label: "选项一" },
              { value: "b", label: "选项二" },
            ]}
            onChange={() => undefined}
          />
          <Stepper
            value="0 秒"
            label="禁用步进"
            focusKey="dev:step-dis"
            disabled
            current={0}
            onChange={() => undefined}
          />
        </Row>
        <Row label="状态胶囊">
          <StatusChip tone="ok">已入库</StatusChip>
          <StatusChip tone="warn">下载中</StatusChip>
          <StatusChip tone="muted">待接入</StatusChip>
        </Row>
        <Row label="元数据字段">
          <MetaField label="字段名" />
          <MetaField label="字段名" value="字段值" />
        </Row>
      </Section>

      <Section title="基础 · 状态">
        <Row label="加载">
          <Skeleton className="dev-skel" />
          <span className="card-skel" aria-hidden="true" />
        </Row>
        <Row label="空">
          <span className="crow-empty">暂无内容</span>
        </Row>
        <Row label="错误 / 重试">
          <span className="dev-error">
            <span className="dot" />
            加载失败
            <Button variant="ghost" focusKey="dev:retry">
              重试
            </Button>
          </span>
        </Row>
      </Section>

      <Section title="占位图（2:3 / 16:9 / 5.4:1）">
        <div className="dev-ph">
          <Placeholder ratio="2:3" />
          <Placeholder ratio="16:9" />
          <Placeholder ratio="5.4:1" />
        </div>
      </Section>

      <Section title="业务 · 卡片">
        <Row label="MediaCard">
          <MediaCard data={null} focusKey="dev:ph1" />
          <MediaCard data={{ ...DEMO_CARD, poster: null }} focusKey="dev:card" />
          <MediaCard data={DEMO_CARD} variant="poster" focusKey="dev:card2" />
        </Row>
        <Row label="海报位">
          <span className="dev-poster">
            <PosterImage src={null} alt="占位海报" />
          </span>
          <span className="dev-poster wide">
            <PosterImage src={null} alt="占位缩略图" ratio="16:9" />
          </span>
        </Row>
      </Section>

      <Section title="业务 · 行与网格">
        <div className="dev-canvas">
          <CardRow row={{ title: "占位行", items: [] }} fill={7} />
        </div>
        <Row label="标签">
          <CategoryTabs
            tags={[
              { key: "a", label: "标签一" },
              { key: "b", label: "标签二" },
              { key: "c", label: "标签三" },
            ]}
            active={tag}
            showFilter
            onSelect={setTag}
            onFilter={() => undefined}
          />
        </Row>
      </Section>

      <Section title="业务 · 列表与播放">
        <Row label="EpisodeList">
          <EpisodeList
            episodes={[
              { id: "1", index: 1, title: "第 1 集" },
              { id: "2", index: 2, title: "第 2 集" },
              { id: "3", index: 3, title: "第 3 集" },
            ]}
            activeId={episode}
            onSelect={setEpisode}
          />
        </Row>
        <Row label="SearchResultItem">
          <SearchResultItem title="组件示例" meta="结构演示" image={null} focusKey="dev:sr" />
        </Row>
        <Row label="SettingItem">
          <SettingItem
            label="设置项"
            description="说明文字"
            control={<Switch checked={checked} label="设置开关" focusKey="dev:st" onChange={setChecked} />}
          />
        </Row>
        <Row label="PlayerControls">
          <span className="dev-player">
            <PlayerControls
              paused={false}
              position={position}
              duration={1800}
              onToggle={() => undefined}
              onSeek={setPosition}
              onBack={() => undefined}
              onOpenTracks={() => undefined}
              onOpenSubtitles={() => setMenuOpen(true)}
            />
          </span>
        </Row>
        <Row label="字幕菜单">
          <Button variant="ghost" focusKey="dev:menu" onSelect={() => setMenuOpen(true)}>
            打开字幕菜单
          </Button>
        </Row>
      </Section>

      <Section title="业务 · 导航与外壳">
        <Row label="NavRail">
          <span className="dev-nav">
            <NavRail active={navRoute} onSelect={setNavRoute} open />
          </span>
        </Row>
        <Row label="NavEdgeTab">
          <span className="dev-edge">
            <NavEdgeTab onExpand={() => setNavRoute("recommend")} />
          </span>
        </Row>
        <Row label="CornerButton">
          <CornerButton onClick={() => setWallOpen(true)} />
        </Row>
        <Row label="ClockBox">
          <span className="dev-clock">
            <ClockBox date="日期" time="12:00" lunar="农历" weather="天气" />
          </span>
        </Row>
        <Row label="EntryShelf">
          <span className="dev-shelf">
            <EntryShelf tiles={DEMO_TILES} onSelect={() => undefined} />
          </span>
        </Row>
      </Section>

      <Section title="业务 · 状态与覆盖层">
        {CONN_STATES.map((state) => (
          <Row key={state} label={`状态 · ${state}`}>
            <span className="dev-conn">
              <ConnectionNotice state={state} message={null} onRetry={() => undefined} />
            </span>
          </Row>
        ))}
        <Row label="ContinueWatchingRow">
          <span className="dev-stage">
            <ContinueWatchingRow open items={[]} />
          </span>
        </Row>
        <Row label="KeyPad">
          <KeyPad
            onKey={() => undefined}
            onSpace={() => undefined}
            onDelete={() => undefined}
            onClear={() => undefined}
            onSearch={() => undefined}
          />
        </Row>
        <Row label="覆盖层入口">
          <Button variant="ghost" focusKey="dev:filter" onSelect={() => setFilterOpen(true)}>
            打开筛选面板
          </Button>
          <Button variant="ghost" focusKey="dev:track" onSelect={() => setTrackOpen(true)}>
            打开音轨菜单
          </Button>
          <Button variant="ghost" focusKey="dev:wall" onSelect={() => setWallOpen(true)}>
            打开壁纸面板
          </Button>
          <Button variant="ghost" focusKey="dev:source" onSelect={() => setSourceOpen(true)}>
            打开播放源浮层
          </Button>
        </Row>
      </Section>

      <Section title="业务 · 分集与人物">
        <Row label="EpisodeCard">
          <EpisodeCard index={1} state="seen" focusKey="dev:ep1" />
          <EpisodeCard index={2} state="active" focusKey="dev:ep2" />
          <EpisodeCard index={3} state="default" focusKey="dev:ep3" />
          <EpisodeCard index={4} state="upcoming" focusKey="dev:ep4" />
        </Row>
        <Row label="CastCard">
          <CastCard focusKey="dev:cast1" />
          <CastCard focusKey="dev:cast2" />
          <CastCard focusKey="dev:cast3" />
        </Row>
      </Section>

      <Section title="业务 · 下载卡">
        <Row label="收起 / 展开">
          <DownloadCard tasks={[{ id: "a", pct: 82 }, { id: "b", pct: 46 }, { id: "c", pct: 24 }]} expanded={false} onToggle={() => setDownloadOpen(true)} />
          <DownloadCard
            tasks={[{ id: "a", pct: 82 }, { id: "b", pct: 46 }, { id: "c", pct: 24 }, { id: "d", pct: 76 }, { id: "e", pct: 12 }, { id: "f", pct: 58 }]}
            expanded={downloadOpen}
            onToggle={() => setDownloadOpen((current) => !current)}
          />
        </Row>
      </Section>

      <Section title="页面入口（另开预览）">
        <div className="dev-links">
          {[
            ["详情 · 电影", "movie"],
            ["详情 · 电视剧", "tv"],
            ["详情 · 番剧", "anime"],
            ["详情 · 未看", "unseen"],
            ["详情 · 已看完", "watched"],
            ["详情 · 仅在线", "online"],
            ["详情 · 播放源展开", "sources"],
          ].map(([label, state]) => (
            <a key={state} className="dev-link" href={`?page=detail&state=${state}`}>
              {label}
            </a>
          ))}
          <a className="dev-link" href="?page=subscribe&state=list">
            订阅 · 列表
          </a>
          <a className="dev-link" href="?page=subscribe&state=list&download=1">
            订阅 · 下载卡展开
          </a>
          <a className="dev-link" href="?page=subscribe&state=movie">
            订阅 · 详情（电影）
          </a>
          <a className="dev-link" href="?page=subscribe&state=tv">
            订阅 · 详情（电视剧）
          </a>
          <a className="dev-link" href="?page=subscribe&state=anime">
            订阅 · 详情（番剧）
          </a>
          <a className="dev-link" href="?page=settings&state=play">
            设置 · 播放
          </a>
          <a className="dev-link" href="?page=settings&state=subtitle">
            设置 · 字幕（隐藏组）
          </a>
          <a className="dev-link" href="?page=player">
            播放页
          </a>
        </div>
      </Section>

      <FilterPanel
        open={filterOpen}
        groups={[
          { label: "类型", options: ["选项一", "选项二", "选项三"] },
          { label: "国家", options: [] },
        ]}
        onClose={() => setFilterOpen(false)}
      />
      <TrackMenu
        open={trackOpen}
        title="音轨"
        name="audio"
        options={[
          { id: "a", label: "轨道一", detail: "默认" },
          { id: "b", label: "轨道二" },
        ]}
        selectedId="a"
        onSelect={() => setTrackOpen(false)}
        onClose={() => setTrackOpen(false)}
      />
      <SourceMenu
        open={sourceOpen}
        options={[
          { id: "a", label: "播放源一", detail: "待接入" },
          { id: "b", label: "播放源二", detail: "待接入" },
          { id: "c", label: "播放源三", detail: "待接入" },
        ]}
        selectedId="a"
        onSelect={() => setSourceOpen(false)}
        onClose={() => setSourceOpen(false)}
      />
      <WallpaperPanel
        open={wallOpen}
        source="black"
        thumbs={[]}
        current={0}
        onSource={() => undefined}
        onPick={() => setWallOpen(false)}
        onClose={() => setWallOpen(false)}
      />

      <SubtitleMenu
        open={menuOpen}
        options={[{ id: "1", label: "字幕轨道一" }]}
        onSelect={() => setMenuOpen(false)}
        onClose={() => setMenuOpen(false)}
      />
    </FocusScope>
  );
}
