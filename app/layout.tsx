import type { Metadata } from "next";
import "./globals.css";

const description = "One prompt, rewritten by an AI every day. Every version becomes an image. No human input.";

export const metadata: Metadata = {
  title: "TNEP — The Neverending Prompt",
  description,
  icons: {
    icon: "/logo/favicon-32.png",
    apple: "/logo/apple-icon.png",
  },
  openGraph: {
    title: "TNEP — The Neverending Prompt",
    description,
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
      <body>
        {children}
      </body>
    </html>
  );
}
