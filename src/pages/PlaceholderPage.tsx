import type { RouteName } from "../data/navigation";

const TITLES: Partial<Record<RouteName, string>> = {
  recommend: "推荐",
  movie: "电影",
  tv: "电视剧",
  anime: "动漫",
  favorites: "收藏",
  search: "搜索",
  live: "直播",
  music: "音乐",
  subscribe: "订阅",
  settings: "设置",
};

interface PlaceholderPageProps {
  route: RouteName;
}

/** 尚未接入后端数据的页面：如实说明，不铺假内容。 */
export function PlaceholderPage({ route }: PlaceholderPageProps) {
  return (
    <section className="page">
      <div className="empty">
        <h2>{TITLES[route] ?? route}</h2>
        <p>该页面正在接入后端数据，暂无可展示内容。</p>
      </div>
    </section>
  );
}
