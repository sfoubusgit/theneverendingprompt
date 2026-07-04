import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TNEP.XYZ — The Never Ending Prompt",
  description: "A daily community game for AI image generation. One prompt, infinite mutations.",
  icons: {
    icon: "/logo/favicon-32.png",
    apple: "/logo/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
