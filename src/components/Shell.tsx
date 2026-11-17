import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { NAV_ROUTES, type RouteName } from "../data/navigation";
import { useSpatialNav, type Direction } from "../focus/spatial";
import { FocusScope } from "./base/FocusScope";
import { NavRail } from "./media/NavRail";
import { NavEdgeTab } from "./media/NavEdgeTab";

interface ShellProps {
  route: RouteName;
  onNavigate: (route: RouteName) => void;
  onBack: () => void;
  children: ReactNode;
}

/**
 * 应用外壳：导航栏 + 焦点作用域 + 页面容器。
 * 导航栏只在影视族页面出现；焦点离开导航栏后收起成左侧「展开」标签，
 * 标签可聚焦，确认后展开并把焦点放回离开导航栏时停留的项。
 */
export function Shell({ route, onNavigate, onBack, children }: ShellProps) {
  const showNav = NAV_ROUTES.has(route);
  const [navOpen, setNavOpen] = useState(true);
  const expandFocus = useRef(false);
  // 离开导航栏时记住最后停留的项，回到导航栏时恢复（不重置为默认项）
  const lastNavKey = useRef<string | null>(null);
  const wasInNav = useRef(false);

  /**
   * 从内容区按左：直接回到离开导航栏时停留的项。
   * 必须在几何导航之前处理——否则焦点会先落到几何最近的导航项，
   * 该项的 onFocus 会立刻切走页面（例如落错到「动漫」）。
   */
  const returnToNav = useCallback(
    (direction: Direction) => {
      if (direction !== "ArrowLeft" || !showNav || !navOpen) return false;
      const key = lastNavKey.current;
      if (!key) return false;
      const active = document.activeElement as HTMLElement | null;
      if (!active || active.closest(".navrail")) return false;
      const target = document.querySelector<HTMLElement>(
        `.navrail [data-focus-key="${key}"]`,
      );
      if (!target) return false;
      target.focus({ preventScroll: true });
      return true;
    },
    [showNav, navOpen],
  );

  useSpatialNav({ enabled: route !== "home", onBack, onBeforeMove: returnToNav });

  // 仅在进入影视族页面时默认展开；页内路由变化保留当前展开/收起状态
  const prevShowNav = useRef(showNav);
  useEffect(() => {
    if (showNav && !prevShowNav.current) setNavOpen(true);
    prevShowNav.current = showNav;
  }, [showNav]);

  // 进入/切换影视族页面时把焦点放在对应导航项（父作用域晚于子作用域执行，最终生效）。
  useEffect(() => {
    if (!showNav) return;
    const raf = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`.navrail [data-focus-key="nav:${route}"]`)?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [showNav, route]);

  useEffect(() => {
    if (!showNav) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(".navrail")) {
        setNavOpen(true);
        const key = target.dataset.focusKey ?? null;
        // 从内容区回到导航栏：先回到离开时的项，而不是几何上最近/默认项
        if (!wasInNav.current && lastNavKey.current && key !== lastNavKey.current) {
          const remembered = document.querySelector<HTMLElement>(
            `.navrail [data-focus-key="${lastNavKey.current}"]`,
          );
          if (remembered) {
            wasInNav.current = true;
            remembered.focus();
            return;
          }
        }
        lastNavKey.current = key ?? lastNavKey.current;
        wasInNav.current = true;
        return;
      }
      wasInNav.current = false;
      if (target.closest(".navtab")) return;
      // 影视首屏进入列表区即收起导航（画布「影视 · 列表态」），离开列表区回到展开。
      setNavOpen(!(route === "recommend" && target.closest(".rows")));
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [showNav, route]);

  useEffect(() => {
    if (!navOpen || !expandFocus.current) return;
    expandFocus.current = false;
    const raf = window.requestAnimationFrame(() => {
      const target =
        document.querySelector<HTMLElement>(
          `.navrail [data-focus-key="${lastNavKey.current ?? `nav:${route}`}"]`,
        ) ??
        document.querySelector<HTMLElement>(`.navrail [data-focus-key="nav:${route}"]`) ??
        document.querySelector<HTMLElement>(".navrail [data-nav]");
      target?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [navOpen, route]);

  const expandNav = () => {
    expandFocus.current = true;
    setNavOpen(true);
  };

  return (
    <div className="shell">
      <FocusScope
        key={route}
        name={route}
        className="page-scope"
        // 播放页自己把焦点放在播放/暂停上，避免作用域自动聚焦落到左上角「返回」
        autoFocus={!showNav && route !== "player"}
        remember={!showNav}
      >
        {showNav && (
          <>
            <NavRail active={route} onSelect={onNavigate} open={navOpen} />
            {!navOpen && <NavEdgeTab onExpand={expandNav} />}
          </>
        )}
        {children}
      </FocusScope>
    </div>
  );
}
