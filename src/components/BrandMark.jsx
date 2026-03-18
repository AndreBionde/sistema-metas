import { useId } from "react";

const BrandMark = ({ className = "", title = "PlanoMeta" }) => {
  const ariaHidden = title ? undefined : true;
  const gradientId = useId().replace(/:/g, "");
  const backgroundId = `${gradientId}-bg`;
  const accentId = `${gradientId}-accent`;

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-hidden={ariaHidden}
      aria-label={title || undefined}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={backgroundId} x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#0a2237" />
          <stop offset="100%" stopColor="#147082" />
        </linearGradient>
        <linearGradient id={accentId} x1="16" y1="44" x2="50" y2="20">
          <stop offset="0%" stopColor="#f2be72" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="56" height="56" rx="18" fill={`url(#${backgroundId})`} />
      <rect x="16" y="34" width="6" height="12" rx="3" fill="rgba(255,255,255,0.18)" />
      <rect x="27" y="28" width="6" height="18" rx="3" fill="rgba(255,255,255,0.22)" />
      <rect x="38" y="22" width="6" height="24" rx="3" fill="rgba(255,255,255,0.26)" />
      <path
        d="M16 41L27 31L35 36L48 21"
        fill="none"
        stroke={`url(#${accentId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="21" r="7" fill="#f7fbfd" fillOpacity="0.96" />
      <circle cx="48" cy="21" r="4" fill="#0f6b72" />
      <circle cx="48" cy="21" r="1.7" fill="#f2be72" />
    </svg>
  );
};

export default BrandMark;
