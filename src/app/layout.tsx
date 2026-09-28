import "@/styles/globals.css";
import { BRAND_ASSETS } from "@/lib/constants";
import { Providers } from "@/lib/providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${BRAND_ASSETS.APP_NAME} ${BRAND_ASSETS.APP_SUFFIX} — ${BRAND_ASSETS.TAGLINE}`,
  description:
    "A creator intelligence platform for video research, packaging, and production management.",
  icons: {
    icon: [
      { url: BRAND_ASSETS.FAVICON, type: "image/x-icon" },
      { url: BRAND_ASSETS.ICON, type: "image/png" },
    ],
    apple: [
      { url: BRAND_ASSETS.APPLE_ICON, sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
