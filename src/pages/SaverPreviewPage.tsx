import { Saver } from "../components/media/Saver";
import { useClock } from "../hooks/useClock";

/** 开发预览：中性壁纸占位 + 真实屏保层，用于核对 200u 时钟与日期。 */
export function SaverPreviewPage() {
  const clock = useClock();

  return (
    <>
      <div className="saver-demo-wall" />
      <Saver on time={clock.saverTime} date={clock.saverDate} />
    </>
  );
}
