/**
 * Generates an SVG data URI to satisfy the Inspiration.thumbnailUrl NOT NULL
 * database requirement when an inspiration is created from a text-only hook breakdown.
 */
export function generateHookPlaceholderSvg(
  title: string,
  emotion = "Hook Strategy",
): string {
  const sanitizedTitle = (title || "Instant AI Hook Breakdown")
    .replace(/[<>&"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    })
    .slice(0, 100);

  const sanitizedEmotion = emotion.toUpperCase().slice(0, 20);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1613" />
      <stop offset="50%" stop-color="#241E1A" />
      <stop offset="100%" stop-color="#120F0D" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF5338" />
      <stop offset="100%" stop-color="#FF8A00" />
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)" />
  <circle cx="640" cy="240" r="80" fill="#FF5338" fill-opacity="0.12" stroke="#FF5338" stroke-width="2" stroke-opacity="0.3" />
  <text x="640" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="54" text-anchor="middle" fill="#FF8A00">⚡</text>
  <rect x="520" y="360" width="240" height="36" rx="18" fill="#FF5338" fill-opacity="0.15" stroke="#FF5338" stroke-width="1.5" stroke-opacity="0.4" />
  <text x="640" y="384" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" letter-spacing="2" text-anchor="middle" fill="#FF5338">${sanitizedEmotion}</text>
  <text x="640" y="470" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="34" text-anchor="middle" fill="#FAF8F5">${sanitizedTitle}</text>
  <text x="640" y="520" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="18" text-anchor="middle" fill="#8C8379">SNIPVIS OS • CREATOR RESEARCH LAB</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
