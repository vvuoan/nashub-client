import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { Button } from "../components/base/Button";
import { FocusScope } from "../components/base/FocusScope";
import { Focusable } from "../components/base/Focusable";
import { Modal } from "../components/base/Modal";
import { Segmented } from "../components/base/Segmented";
import { Slider } from "../components/base/Slider";
import { StatusChip } from "../components/base/StatusChip";
import { Stepper } from "../components/base/Stepper";
import { Switch } from "../components/base/Switch";
import { api } from "../data/api";
import type { UiStatus } from "../ui/state";

export type SettingsGroup =
  | "play"
  | "danmaku"
  | "network"
  | "appearance"
  | "power"
  | "security"
  | "status"
  | "about"
  | "dev"
  | "subtitle"
  | "source";

interface SettingsPageProps {
  group?: SettingsGroup;
}

const GROUPS: { key: SettingsGroup; label: string }[] = [
  { key: "play", label: "播放" },
  { key: "danmaku", label: "弹幕" },
  { key: "network", label: "网络" },
  { key: "source", label: "来源" },
  { key: "appearance", label: "外观" },
  { key: "power", label: "屏保与省电" },
  { key: "security", label: "安全" },
  { key: "status", label: "系统状态" },
  { key: "about", label: "关于" },
  { key: "dev", label: "开发模式" },
  { key: "subtitle", label: "字幕" },
];

const FOOTERS: Record<SettingsGroup, string> = {
  play: "设置保存在本机 · 已与 NAS 端同步",
  danmaku: "弹幕为纯客户端设置 · 不影响服务端",
  network: "超时范围 1–120 秒 · 数值改动即时生效",
  source: "来源凭据只读展示 · 地址与开关按服务端能力生效",
  appearance: "壁纸为纯客户端设置 · 不上传任何数据",
  power: "关屏、待机、HDMI-CEC 已在当前版本移除",
  security: "库 ID 与路径不在此页展示",
  status: "存储占用 ≥ 85% 时会以金色警示",
  about: "更新需在 NAS 端手动执行",
  dev: "诊断信息仅供开发排查 · 不随设置同步",
  subtitle: "键位补齐后打开即可用，无需改版式",
};

const APP_VERSION = "v0.1.0";

function Row({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return (
    <div className="set-row">
      <div className="set-texts">
        <p className="set-label">{label}</p>
        {description && <p className="set-desc">{description}</p>}
      </div>
      <div className="set-control">{children}</div>
    </div>
  );
}

function ValueBar({ w = 220 }: { w?: number }) {
  return <span className="set-value-bar" style={{ width: `calc(${w} * var(--u))` }} aria-hidden="true" />;
}

/** 设置页：画布八组 + 隐藏的字幕组，所有控件即时生效。 */
export function SettingsPage({ group: initial = "play" }: SettingsPageProps) {
  const [group, setGroup] = useState<SettingsGroup>(initial);
  const [track, setTrack] = useState("auto");
  const [audioLang, setAudioLang] = useState("zh");
  const [hdr, setHdr] = useState(true);
  const [danmaku, setDanmaku] = useState(true);
  const [dmSize, setDmSize] = useState("mid");
  const [dmAlpha, setDmAlpha] = useState("60");
  const [dmArea, setDmArea] = useState(60);
  const [jellyfin, setJellyfin] = useState(45);
  const [bangumi, setBangumi] = useState(20);
  const [wall, setWall] = useState("builtin");
  const [rotate, setRotate] = useState(true);
  const [screensaver, setScreensaver] = useState(true);
  const [wait, setWait] = useState("5");
  const [subLang, setSubLang] = useState("follow");
  const [autoSub, setAutoSub] = useState(false);
  const [subSize, setSubSize] = useState("mid");
  const [jellyfinAddr, setJellyfinAddr] = useState("未配置");
  const [openlistSearch, setOpenlistSearch] = useState(true);
  const [publicSource, setPublicSource] = useState("iptv-org");
  const [extraSources, setExtraSources] = useState(3);
  const [thunder, setThunder] = useState("on");
  const [assrt, setAssrt] = useState(true);
  const [metadata, setMetadata] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);
  // 数据态示范：idle → loading → ok / error（契约见 docs/design/14-component-state-contract.md）
  const [testStatus, setTestStatus] = useState<UiStatus>("idle");

  const visible = GROUPS.filter((item) => item.key !== "subtitle" || group === "subtitle");

  const closeReset = () => setResetOpen(false);

  const testConnection = () => {
    if (testStatus === "loading") return;
    setTestStatus("loading");
    void api
      .health()
      .then(() => setTestStatus("ok"))
      .catch(() => setTestStatus("error"));
  };

  const restoreSourceDefaults = () => {
    setJellyfinAddr("未配置");
    setOpenlistSearch(true);
    setPublicSource("iptv-org");
    setExtraSources(3);
    setThunder("on");
    setAssrt(true);
    setMetadata(true);
    closeReset();
  };

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-focus-key="set:nav:${group}"]`)?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [group]);

  /**
   * 设置页是「左分组 + 右控件」两列。纯几何导航会按元素中心点评分：
   * 分组标签宽度不同（70/104/121），中心 x 偏移，导致 ↓ 跳过「屏保与省电」、
   * → 跳到别的分组、控件里 ↓ 又跳回左栏。这里按列显式收口。
   */
  const handleKeys = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const active = document.activeElement as HTMLElement | null;
    if (!active) return;

    const navItems = Array.from(document.querySelectorAll<HTMLElement>(".set-nav [data-nav]"));
    const controls = Array.from(document.querySelectorAll<HTMLElement>(".set-card [data-nav]")).filter(
      (el) => el.getBoundingClientRect().width > 2,
    );

    if (active.closest(".set-nav")) {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        const index = navItems.indexOf(active);
        if (index < 0) return;
        const next = navItems[index + (event.key === "ArrowDown" ? 1 : -1)];
        event.preventDefault();
        event.stopPropagation();
        next?.focus();
        return;
      }
      if (event.key === "ArrowRight") {
        const first = controls[0];
        if (!first) return;
        event.preventDefault();
        event.stopPropagation();
        first.focus();
      }
      return;
    }

    if (!active.closest(".set-card")) return;

    // 按行分组：同一条设置行里的分段/开关视为一行
    const rows: HTMLElement[][] = [];
    for (const el of controls) {
      const top = el.getBoundingClientRect().top;
      const last = rows[rows.length - 1];
      if (!last || Math.abs(top - last[0].getBoundingClientRect().top) > 24) rows.push([el]);
      else last.push(el);
    }
    const rowIndex = rows.findIndex((row) => row.includes(active));
    if (rowIndex < 0) return;
    const byLeft = (a: HTMLElement, b: HTMLElement) => a.getBoundingClientRect().left - b.getBoundingClientRect().left;

    if (event.key === "ArrowLeft") {
      // 行内左移交给几何导航；已经在行首才回到当前分组
      if (rows[rowIndex].slice().sort(byLeft)[0] !== active) return;
      const item = document.querySelector<HTMLElement>(`[data-focus-key="set:nav:${group}"]`);
      if (!item) return;
      event.preventDefault();
      event.stopPropagation();
      item.focus();
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const target = rows[rowIndex + (event.key === "ArrowDown" ? 1 : -1)];
      event.preventDefault();
      event.stopPropagation();
      target?.slice().sort(byLeft)[0]?.focus();
    }
  };

  return (
    <FocusScope name="settings" className={`settings grp-${group}`} autoFocus onKeyDown={handleKeys}>
      <header className="set-head">
        <h1>设置</h1>
        <p>
          {group === "subtitle"
            ? "字幕分组 · 待后端键就绪后启用，当前版本整组隐藏"
            : "改动即时生效 · 方向键切换分组，确认键保存"}
        </p>
      </header>

      <nav className="set-nav" aria-label="设置分组">
        {visible.map((item) => (
          <Focusable
            key={item.key}
            className={item.key === group ? "set-navitem on" : "set-navitem"}
            focusKey={`set:nav:${item.key}`}
            onFocus={() => {
              if (item.key !== group) setGroup(item.key);
            }}
            onSelect={() => setGroup(item.key)}
          >
            {item.label}
          </Focusable>
        ))}
      </nav>

      <section className="set-card" key={group}>
        {group === "play" && (
          <>
            <Row label="默认音轨" description="自动 = 跟随系统语言">
              <Segmented
                value={track}
                label="默认音轨"
                focusKey="set:track"
                options={[
                  { value: "auto", label: "自动" },
                  { value: "first", label: "首条" },
                  { value: "zh", label: "中文" },
                ]}
                onChange={setTrack}
              />
            </Row>
            <Row label="首选音轨语言">
              <Segmented
                value={audioLang}
                label="首选音轨语言"
                focusKey="set:alang"
                options={[
                  { value: "zh", label: "中文" },
                  { value: "ja", label: "日语" },
                  { value: "en", label: "英语" },
                ]}
                onChange={setAudioLang}
              />
            </Row>
            <Row label="HDR 优先" description="关闭后统一按 SDR 输出">
              <Switch checked={hdr} label="HDR 优先" focusKey="set:hdr" onChange={setHdr} />
            </Row>
          </>
        )}

        {group === "danmaku" && (
          <>
            <Row label="默认显示弹幕" description="进入播放即加载弹幕">
              <Switch checked={danmaku} label="默认显示弹幕" focusKey="set:dm" onChange={setDanmaku} />
            </Row>
            <Row label="弹幕字号">
              <Segmented
                value={dmSize}
                label="弹幕字号"
                focusKey="set:dms"
                options={[
                  { value: "sm", label: "小" },
                  { value: "mid", label: "中" },
                  { value: "lg", label: "大" },
                ]}
                onChange={setDmSize}
              />
            </Row>
            <Row label="弹幕透明度">
              <Segmented
                value={dmAlpha}
                label="弹幕透明度"
                focusKey="set:dma"
                options={[
                  { value: "80", label: "80%" },
                  { value: "60", label: "60%" },
                  { value: "40", label: "40%" },
                ]}
                onChange={setDmAlpha}
              />
            </Row>
            <Row label="弹幕显示区域" description="顶部固定，0%–100% 向下可调">
              <Slider value={dmArea} label="弹幕显示区域" focusKey="set:dmarea" onChange={setDmArea} />
            </Row>
            <Row label="弹幕源 · 主源" description="只读 · 由服务端决定">
              <StatusChip tone="muted">待接入</StatusChip>
            </Row>
            <Row label="弹幕源 · 兜底源" description="只读 · 主源不可用时接管">
              <StatusChip tone="muted">待接入</StatusChip>
            </Row>
          </>
        )}

        {group === "network" && (
          <>
            <Row label="NAS 地址" description="支持 IP 或域名，默认 8096 端口">
              <span className="set-input">未设置</span>
              <Button variant="ghost" focusKey="set:keyboard">
                屏幕键盘
              </Button>
            </Row>
            <Row label="测试连接" description="连接状态由后端返回">
              <StatusChip status={testStatus} />
              <Button
                variant="ghost"
                focusKey="set:test"
                loading={testStatus === "loading"}
                onSelect={testConnection}
              >
                测试连接
              </Button>
            </Row>
            <Row label="Jellyfin 超时">
              <Stepper
                value={`${jellyfin} 秒`}
                label="Jellyfin 超时"
                focusKey="set:jf"
                min={1}
                max={120}
                step={5}
                current={jellyfin}
                onChange={setJellyfin}
              />
            </Row>
            <Row label="Bangumi 超时">
              <Stepper
                value={`${bangumi} 秒`}
                label="Bangumi 超时"
                focusKey="set:bgm"
                min={1}
                max={120}
                step={5}
                current={bangumi}
                onChange={setBangumi}
              />
            </Row>
          </>
        )}

        {group === "source" && (
          <>
            <Row label="Jellyfin 地址" description="只读 · 由服务端返回，不可在客户端改写">
              <span className="set-input">{jellyfinAddr}</span>
              <Button variant="ghost" focusKey="set:source:jf-reset" onSelect={() => setJellyfinAddr("未配置")}>
                恢复默认
              </Button>
            </Row>
            <Row label="Jellyfin 凭据" description="只读 · 不展示用户名与密钥">
              <StatusChip tone="muted">未配置</StatusChip>
            </Row>
            <Row label="OpenList 地址" description="只读 · 搜索走 OpenList 索引">
              <span className="set-input">未配置</span>
              <Switch
                checked={openlistSearch}
                label="OpenList 搜索"
                focusKey="set:source:ol"
                onChange={setOpenlistSearch}
              />
            </Row>
            <Row label="直播源 M3U" description="后端 live-tv 插件读取的源地址">
              <span className="set-input">未配置</span>
            </Row>
            <Row label="公共源" description="M3U 为空时使用的公共频道源">
              <Segmented
                value={publicSource}
                label="公共源"
                focusKey="set:source:public"
                options={[
                  { value: "iptv-org", label: "iptv-org" },
                  { value: "fanmingming", label: "fanmingming" },
                  { value: "off", label: "关闭" },
                ]}
                onChange={setPublicSource}
              />
            </Row>
            <Row label="额外源数量" description="0–10 · 公共源之外的候选地址数">
              <Stepper
                value={`${extraSources} 个`}
                label="额外源数量"
                focusKey="set:source:extra"
                min={0}
                max={10}
                step={1}
                current={extraSources}
                onChange={setExtraSources}
              />
            </Row>
            <Row label="EPG 地址" description="节目单 XMLTV 来源">
              <span className="set-input">未配置</span>
            </Row>
            <Row label="刷新频道" description="拉取 M3U → 解析 → 更新频道表">
              <Button variant="ghost" focusKey="set:source:refresh-ch">
                刷新频道
              </Button>
            </Row>
            <Row label="刷新节目单" description="重新抓取 EPG，失败时保留旧表">
              <Button variant="ghost" focusKey="set:source:refresh-epg">
                刷新节目单
              </Button>
            </Row>
            <Row label="字幕源（迅雷）" description="字幕优先由迅雷接口提供">
              <Segmented
                value={thunder}
                label="字幕源"
                focusKey="set:source:thunder"
                options={[
                  { value: "on", label: "迅雷" },
                  { value: "off", label: "关闭" },
                ]}
                onChange={setThunder}
              />
            </Row>
            <Row label="Assrt" description="迅雷不可用时的兜底字幕源">
              <Switch checked={assrt} label="Assrt" focusKey="set:source:assrt" onChange={setAssrt} />
            </Row>
            <Row label="Assrt 地址" description="只读 · 由服务端配置">
              <span className="set-input">未配置</span>
            </Row>
            <Row label="外部元数据" description="允许从外部源补充简介、评分与海报">
              <Switch
                checked={metadata}
                label="外部元数据"
                focusKey="set:source:meta"
                onChange={setMetadata}
              />
            </Row>
            <Row label="通知" description="只读 · 通知渠道由 NAS 端决定">
              <StatusChip tone="muted">跟随服务端</StatusChip>
            </Row>
            <Row label="恢复本组默认" description="只影响来源组，不改 Jellyfin 凭据">
              <Button
                variant="ghost"
                className="danger"
                focusKey="set:source:reset"
                onSelect={() => setResetOpen(true)}
              >
                恢复默认
              </Button>
            </Row>
          </>
        )}

        {group === "appearance" && (
          <>
            <Row label="壁纸来源">
              <Segmented
                value={wall}
                label="壁纸来源"
                focusKey="set:wall"
                options={[
                  { value: "builtin", label: "内置" },
                  { value: "nas", label: "NAS 剧照" },
                  { value: "black", label: "纯黑" },
                ]}
                onChange={setWall}
              />
            </Row>
            <Row label="更换壁纸" description="当前壁纸由本地配置决定">
              <Button variant="ghost" focusKey="set:wallpick">
                更换壁纸
              </Button>
            </Row>
            <Row label="自动轮换" description="每 30 分钟随机切换一张">
              <Switch checked={rotate} label="自动轮换" focusKey="set:rotate" onChange={setRotate} />
            </Row>
          </>
        )}

        {group === "power" && (
          <>
            <Row label="屏保" description="闲置达到等待时长后进入屏保画面">
              <Switch checked={screensaver} label="屏保" focusKey="set:ss" onChange={setScreensaver} />
            </Row>
            <Row label="等待时长">
              <Segmented
                value={wait}
                label="等待时长"
                focusKey="set:wait"
                options={[
                  { value: "3", label: "3 分钟" },
                  { value: "5", label: "5 分钟" },
                  { value: "10", label: "10 分钟" },
                  { value: "30", label: "30 分钟" },
                ]}
                onChange={setWait}
              />
            </Row>
          </>
        )}

        {group === "security" && (
          <>
            <Row label="PIN 状态" description="只读">
              <StatusChip tone="muted">未设置</StatusChip>
            </Row>
            <Row label="修改 PIN" description="当前 PIN → 新 PIN → 确认，各 6 位数字">
              <Button variant="ghost" focusKey="set:pin">
                修改 PIN
              </Button>
            </Row>
            <Row label="立即锁定" description="执行前需二次确认">
              <Button variant="ghost" className="danger" focusKey="set:lock">
                立即锁定
              </Button>
            </Row>
          </>
        )}

        {group === "status" && (
          <>
            <Row label="健康状态">
              <StatusChip tone="muted">待接入</StatusChip>
            </Row>
            <Row label="存储占用">
              <ValueBar />
            </Row>
            <Row label="插件可用数" description="可用数量由后端返回">
              <ValueBar w={140} />
            </Row>
            <Row label="日志上报">
              <StatusChip tone="muted">待接入</StatusChip>
            </Row>
          </>
        )}

        {group === "about" && (
          <>
            <Row label="客户端版本">
              <span className="set-value">{APP_VERSION}</span>
            </Row>
            <Row label="后端版本">
              <ValueBar w={120} />
            </Row>
            <Row label="检查更新" description="更新需在 NAS 端手动执行">
              <Button variant="ghost" focusKey="set:update">
                检查更新
              </Button>
            </Row>
            <Row label="更新说明">
              <span className="set-notes" aria-hidden="true">
                <span className="set-note-bar" />
                <span className="set-note-bar short" />
              </span>
            </Row>
          </>
        )}

        {group === "dev" && (
          <>
            <Row label="诊断汇总">
              <Button variant="ghost" focusKey="set:diag">
                生成汇总
              </Button>
            </Row>
            <Row label="日志占用">
              <ValueBar w={160} />
            </Row>
            <Row label="日志日期选择">
              <Button variant="ghost" focusKey="set:logdate">
                选择日期
              </Button>
            </Row>
            <Row label="日志查询">
              <Button variant="ghost" focusKey="set:logquery">
                查询日志
              </Button>
            </Row>
            <Row label="插件明细与最近错误" description="错误详情由后端返回">
              <Button variant="ghost" focusKey="set:plugins">
                查看明细
              </Button>
            </Row>
            <Row label="插件启停与配置">
              <Button variant="ghost" focusKey="set:pluginconf">
                管理插件
              </Button>
            </Row>
            <Row label="traceId">
              <ValueBar w={220} />
            </Row>
            <Row label="配置来源计数">
              <ValueBar w={300} />
            </Row>
            <Row label="构建时间">
              <ValueBar w={180} />
            </Row>
            <Row label="13 键自检">
              <Button variant="ghost" focusKey="set:selftest">
                开始自检
              </Button>
            </Row>
            <Row label="重置本地偏好" description="仅清除本机设置，不影响 NAS 端">
              <Button variant="ghost" className="danger" focusKey="set:reset">
                重置
              </Button>
            </Row>
          </>
        )}

        {group === "subtitle" && (
          <>
            <div className="set-warn">
              <span className="set-warn-bar" aria-hidden="true" />
              本组三项需要后端补充字幕键，键位就绪前整组隐藏，左侧导航不出现此分组
            </div>
            <Row label="默认字幕语言" description="待启用">
              <Segmented
                value={subLang}
                label="默认字幕语言"
                focusKey="set:sublang"
                options={[
                  { value: "follow", label: "跟随音轨" },
                  { value: "zh", label: "中文" },
                  { value: "en", label: "英文" },
                ]}
                onChange={setSubLang}
              />
            </Row>
            <Row label="自动匹配" description="待启用">
              <Switch checked={autoSub} label="自动匹配" focusKey="set:autosub" onChange={setAutoSub} />
            </Row>
            <Row label="字幕字号" description="待启用">
              <Segmented
                value={subSize}
                label="字幕字号"
                focusKey="set:subsize"
                options={[
                  { value: "sm", label: "小" },
                  { value: "mid", label: "中" },
                  { value: "lg", label: "大" },
                ]}
                onChange={setSubSize}
              />
            </Row>
          </>
        )}
      </section>

      <footer className="set-foot">
        <span>{FOOTERS[group]}</span>
        <span>客户端 {APP_VERSION}</span>
      </footer>

      <Modal
        open={resetOpen}
        name="settings-source-reset"
        title="恢复来源组默认？"
        returnFocusKey="set:source:reset"
        onClose={closeReset}
      >
        <p className="set-confirm-text">
          将重置 OpenList 搜索、公共源、额外源数量、迅雷字幕、Assrt 与外部元数据。Jellyfin 凭据与服务端地址不会被改写。
        </p>
        <div className="set-confirm-actions">
          <Button variant="ghost" focusKey="set:source:reset-cancel" onSelect={closeReset}>
            取消
          </Button>
          <Button
            variant="ghost"
            className="danger"
            focusKey="set:source:reset-ok"
            onSelect={restoreSourceDefaults}
          >
            恢复默认
          </Button>
        </div>
      </Modal>
    </FocusScope>
  );
}
