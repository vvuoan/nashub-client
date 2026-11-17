import { Focusable } from "../base/Focusable";
import { Image } from "../base/Image";
import { Placeholder } from "../base/Placeholder";

interface CastCardProps {
  /** 姓名与角色；为空时只显示占位头像与占位条 */
  name?: string | null;
  role?: string | null;
  photo?: string | null;
  focusKey?: string;
}

/** 画布「人物卡」：88×104，方形头像 + 姓名 + 角色。 */
export function CastCard({ name, role, photo, focusKey }: CastCardProps) {
  return (
    <Focusable className="cast" focusKey={focusKey} ariaLabel={name ?? "演职人员占位"}>
      <span className="cast-art">
        <Image src={photo ?? null} alt={name ?? "人物占位"} placeholder={<Placeholder ratio="1:1" />} />
      </span>
      {name ? <span className="cast-t">{name}</span> : <span className="cast-bar" aria-hidden="true" />}
      {role ? <span className="cast-r">{role}</span> : <span className="cast-bar s" aria-hidden="true" />}
    </Focusable>
  );
}
