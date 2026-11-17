import { NAV_ITEMS, type RouteName } from "../../data/navigation";
import { Focusable } from "../base/Focusable";
import { NavIcon } from "../base/NavIcon";

interface NavRailProps {
  active: RouteName;
  onSelect: (route: RouteName) => void;
  /** 收起时滑出屏幕并退出焦点序列 */
  open: boolean;
}

/** 画布「导航栏 · 展开」：76 宽、6 项、每项 84 高、间距 12、圆角 18。 */
export function NavRail({ active, onSelect, open }: NavRailProps) {
  return (
    <nav
      className={open ? "navrail open" : "navrail"}
      aria-label="主导航"
      aria-hidden={!open}
    >
      {NAV_ITEMS.map((item) => (
        <Focusable
          key={item.route}
          className={item.route === active ? "navitem on" : "navitem"}
          focusKey={`nav:${item.route}`}
          ariaLabel={item.label}
          onFocus={() => {
            // 焦点移动即切换页面，不再要求再按一次确认键
            if (item.route !== active) onSelect(item.route);
          }}
          onSelect={() => onSelect(item.route)}
        >
          <NavIcon name={item.icon} />
          <span>{item.label}</span>
        </Focusable>
      ))}
    </nav>
  );
}
