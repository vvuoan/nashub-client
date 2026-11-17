import type { SVGProps } from "react";
import type { IconName } from "../types";

type Props = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function TileIcon({ name, ...rest }: Props & { name: IconName }) {
  switch (name) {
    case "film":
      return (
        <Base {...rest}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
        </Base>
      );
    case "live":
      return (
        <Base {...rest}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="m8 3 4 4 4-4" />
          <circle cx="12" cy="13.5" r="2.4" />
        </Base>
      );
    case "music":
      return (
        <Base {...rest}>
          <path d="M9 18V6l10-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="16.5" cy="16" r="2.5" />
        </Base>
      );
    case "search":
      return (
        <Base {...rest}>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </Base>
      );
    case "sub":
      return (
        <Base {...rest}>
          <path d="M4 6h16v12H4z" />
          <path d="m9 10 4 2-4 2z" />
        </Base>
      );
    case "gear":
      return (
        <Base {...rest}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
        </Base>
      );
  }
}

export function PlayIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function ChevronDown(props: Props) {
  return (
    <Base {...props}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  );
}

export function CloudIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M7 18h10a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.8-.8A3.9 3.9 0 0 0 7 18Z" />
    </Base>
  );
}

export function CornerIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 5h3v3H4zM10 5h3v3h-3zM16 5h3v3h-3zM4 10h3v3H4zM10 10h3v3h-3zM16 10h3v3h-3zM4 15h3v3H4zM10 15h3v3h-3zM16 15h3v3h-3z" />
    </Base>
  );
}
