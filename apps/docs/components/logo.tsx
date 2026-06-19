/**
 * The re-reduced mark — indigo node-hexagon around a coral isometric cube.
 * Inlined (not an <img>) so it renders crisp at any size and ignores basePath.
 * `currentColor` is not used: the brand colors are fixed in both themes.
 */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="re-reduced"
    >
      <g stroke="#EF5C4C" strokeWidth="3" strokeLinecap="round">
        <line x1="36.76" y1="10.75" x2="48.02" y2="17.25" />
        <line x1="52.78" y1="25.5" x2="52.78" y2="38.5" />
        <line x1="48.02" y1="46.75" x2="36.76" y2="53.25" />
        <line x1="27.24" y1="53.25" x2="15.98" y2="46.75" />
        <line x1="11.22" y1="38.5" x2="11.22" y2="25.5" />
        <line x1="15.98" y1="17.25" x2="27.24" y2="10.75" />
      </g>
      <g fill="#2E2A7C">
        <circle cx="32" cy="8" r="4.5" />
        <circle cx="52.78" cy="20" r="4.5" />
        <circle cx="52.78" cy="44" r="4.5" />
        <circle cx="32" cy="56" r="4.5" />
        <circle cx="11.22" cy="44" r="4.5" />
        <circle cx="11.22" cy="20" r="4.5" />
      </g>
      <polygon points="32,23 41,27.5 32,32 23,27.5" fill="#F2705E" />
      <polygon points="23,27.5 32,32 32,41 23,36.5" fill="#EC5747" />
      <polygon points="41,27.5 32,32 32,41 41,36.5" fill="#D5402E" />
    </svg>
  );
}
