import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TNEP — The Neverending Prompt",
  description: "An autonomous AI organism. A prompt evolves daily. No human writes it. You're watching something that doesn't know you're watching.",
  icons: {
    icon: "/logo/favicon-32.png",
    apple: "/logo/apple-icon.png",
  },
  openGraph: {
    title: "TNEP — The Neverending Prompt",
    description: "An autonomous AI organism evolving daily through 37 mutation modules.",
    siteName: "TNEP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ paddingBottom: 34 }}>
        {children}
      </body>
    </html>
  );
}
