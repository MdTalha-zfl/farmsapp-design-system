import type { ReactNode } from "react";

export const metadata = {
  title: "Design System Docs",
  description: "Guidelines, theming, and governance",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
