import type { IconProps } from "./types";

/** Brand glyph — ported verbatim from the design export (icons.jsx). */
export function IconBoard({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 215 512"
      fill="currentColor"
      stroke="none"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(107.5,0) scale(1.28,1) translate(-107.5,0)">
        <g transform="translate(0,512) scale(0.1,-0.1)">
          <path
            d="M1050 5104 c-348 -126 -710 -1011 -805 -1969 -78 -792 68 -1956 381 -3032 18 -60 51 -103 82 -103 10 0 109 31 220 68 l202 68 202 -68 c216 -73 245 -77 274 -33 17 26 58 164 114 385 262 1037 366 1996 295 2715 -81 815 -356 1594 -663 1875 -105 97 -206 128 -302 94z m24 -4523 c26 -29 86 -29 112 0 19 21 19 75 24 2183 l5 2161 49 -50 c126 -127 270 -409 381 -740 104 -314 183 -707 214 -1065 47 -546 -6 -1230 -155 -1985 -66 -334 -194 -867 -215 -889 -4 -5 -78 15 -173 48 -90 31 -174 56 -186 56 -12 0 -96 -25 -186 -56 -95 -33 -169 -53 -173 -48 -5 5 -29 88 -54 184 -264 1010 -378 1976 -316 2690 31 358 110 751 214 1065 111 331 255 613 381 740 l49 50 5 -2161 c5 -2108 5 -2162 24 -2183z"
            stroke="currentColor"
            strokeWidth={60}
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}
