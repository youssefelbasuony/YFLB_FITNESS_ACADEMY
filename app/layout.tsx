import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YFLB Fitness Academy | دليل واضح للبدء في النادي",
  description: "تعرّف على أجهزة النادي وطريقة استخدامها والعضلات المستهدفة، مع إرشادات واضحة للمبتدئين وخطة تدريب أولية.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl" data-theme="light"><body>{children}</body></html>;
}
