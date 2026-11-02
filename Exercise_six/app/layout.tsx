import "./globals.css";
import "katex/dist/katex.min.css";
import "streamdown/styles.css";
import { Toaster } from "@/components/ui/toast"
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
