import type { SVGProps } from "react";

export type NavIconName = "recommend" | "movie" | "tv" | "anime" | "favorites" | "search";

type Props = SVGProps<SVGSVGElement> & { name: NavIconName };

/** 导航图标（画布 24×24，线宽 1.7）。 */
export function NavIcon({ name, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {name === "recommend" && (
        <>
          <path d="M12 3.2 14.1 9l6.1 2.1-6.1 2.1L12 19.4 9.9 13.2 3.8 11.1 9.9 9Z" />
          <path d="M18.6 16.4 19.5 19l2.6.9-2.6.9-.9 2.6" opacity=".6" />
        </>
      )}
      {name === "movie" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
        </>
      )}
      {name === "tv" && (
        <>
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="m8 4 4 4 4-4" />
          <path d="M8 13h8" opacity=".6" />
        </>
      )}
      {name === "anime" && (
        <>
          <path d="M4 16c1.8-5.6 5-8.4 9.6-8.4 2.4 0 4.4.9 5.9 2.7" />
          <path d="M17.6 7.8 20 12l-4.6 1" />
          <circle cx="9.4" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
        </>
      )}
      {name === "favorites" && (
        <>
          <path d="M6 4h12v16l-6-4.2L6 20Z" />
          <path d="M9.5 9h5" opacity=".6" />
        </>
      )}
      {name === "search" && (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </>
      )}
    </svg>
  );
}
