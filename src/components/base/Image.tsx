import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Skeleton } from "./Skeleton";

interface ImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  style?: CSSProperties;
  fit?: "cover" | "contain";
  /** 无图 / 加载失败时的可见占位文案 */
  emptyLabel?: string;
  /** 无图 / 加载失败时的占位内容，优先级高于 emptyLabel */
  placeholder?: ReactNode;
  onStatus?: (status: "loading" | "ok" | "error") => void;
}

type Status = "loading" | "ok" | "error";

/**
 * 统一的图片加载能力：预加载、淡入、失败占位。
 * 不拼接图片地址、不依赖任何数据层，地址由业务组件传入。
 */
export function Image({
  src,
  alt,
  className,
  style,
  fit = "cover",
  emptyLabel = "暂无图片",
  placeholder,
  onStatus,
}: ImageProps) {
  const [status, setStatus] = useState<Status>(src ? "loading" : "error");

  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  useEffect(() => {
    onStatus?.(status);
  }, [status, onStatus]);

  return (
    <div className={["img", className].filter(Boolean).join(" ")} style={style} data-state={status}>
      {status === "loading" && <Skeleton className="img-skeleton" />}
      {src && (
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ objectFit: fit }}
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
        />
      )}
      {status === "error" && (placeholder ?? <span className="img-empty">{emptyLabel}</span>)}
    </div>
  );
}
