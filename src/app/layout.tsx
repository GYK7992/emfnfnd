import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "emfnfnd - 친구들과 순간을 나눠요",
  description: "사진과 글로 일상을 공유하는 소셜 미디어",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
