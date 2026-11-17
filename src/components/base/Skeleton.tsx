interface SkeletonProps {
  className?: string;
  /** 骨架宽高比，如 "2 / 3" */
  ratio?: string;
}

/** 加载骨架：纯视觉，不含数据。 */
export function Skeleton({ className, ratio }: SkeletonProps) {
  return (
    <span
      className={["skeleton", className].filter(Boolean).join(" ")}
      style={ratio ? { aspectRatio: ratio } : undefined}
      aria-hidden="true"
    />
  );
}
