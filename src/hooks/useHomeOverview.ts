import { useEffect, useState } from "react";
import { api, type HomeOverview } from "../data/api";

/** 天气 / 农历来自后端；失败就不显示，不用占位假数据。 */
export function useHomeOverview(): HomeOverview | null {
  const [overview, setOverview] = useState<HomeOverview | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .homeOverview()
      .then((data) => {
        if (alive) setOverview(data);
      })
      .catch(() => {
        if (alive) setOverview(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  return overview;
}
