import { Focusable } from "../base/Focusable";

interface NavEdgeTabProps {
  onExpand: () => void;
}

/**
 * 画布「导航栏 · 展开提示」：28×80，贴在屏幕左缘、与导航栏垂直居中。
 * 只在导航栏收起时出现；它不是装饰，是展开导航栏的按钮。
 */
export function NavEdgeTab({ onExpand }: NavEdgeTabProps) {
  return (
    <Focusable className="navtab" focusKey="nav:expand" ariaLabel="展开导航栏" onSelect={onExpand}>
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="m5 2.5 4.5 4.5L5 11.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Focusable>
  );
}
