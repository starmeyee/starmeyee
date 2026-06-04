import type { Metadata } from "next";
import { Klee_One, Oleo_Script, Schoolbell } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const kleeOne = Klee_One({
  weight: ["400", "600"],
  variable: "--font-klee-one",
  subsets: ["latin"],
});

const oleoScript = Oleo_Script({
  weight: ["400", "700"],
  variable: "--font-oleo-script",
  subsets: ["latin"],
});

const schoolbell = Schoolbell({
  weight: "400",
  variable: "--font-schoolbell",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StarMeyee",
  description: "StarMeyee Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kleeOne.variable} ${oleoScript.variable} ${schoolbell.variable} font-klee antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
