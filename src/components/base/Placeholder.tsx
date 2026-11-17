export type PlaceholderRatio = "2:3" | "16:9" | "5.4:1" | "1:1";

interface PlaceholderProps {
  ratio?: PlaceholderRatio;
  className?: string;
  label?: string;
}

/**
 * 中性占位图：暗色渐变 + 极简图形，不含任何影视信息。
 * 只做视觉填充，真实数据接入后由图片组件替换。
 */
export function Placeholder({ ratio = "2:3", className, label = "占位图" }: PlaceholderProps) {
  return (
    <span
      className={["ph", className].filter(Boolean).join(" ")}
      style={{ aspectRatio: ratio.replace(":", " / ") }}
      role="img"
      aria-label={label}
      data-ratio={ratio}
    />
  );
}
