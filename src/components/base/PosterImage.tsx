import { Image } from "./Image";
import { Placeholder } from "./Placeholder";

interface PosterImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  emptyLabel?: string;
  /** 占位比例：海报 2:3、缩略图 16:9、通栏 5.4:1 */
  ratio?: "2:3" | "16:9" | "5.4:1";
}

/** 占位优先的海报位；地址由业务组件传入，没有图就显示中性占位。 */
export function PosterImage({
  src,
  alt,
  className,
  emptyLabel = "暂无海报",
  ratio = "2:3",
}: PosterImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={["poster-img", className].filter(Boolean).join(" ")}
      style={{ aspectRatio: ratio.replace(":", " / ") }}
      emptyLabel={emptyLabel}
      placeholder={<Placeholder ratio={ratio} />}
    />
  );
}
