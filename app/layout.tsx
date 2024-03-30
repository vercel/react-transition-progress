import "./globals.css";
import { ProgressBar, ProgressBarProvider } from "@/react-transition-progress";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ProgressBarProvider>
          <ProgressBar className="fixed h-1 shadow-lg shadow-sky-500/20 bg-sky-500 top-0" />
          {children}
        </ProgressBarProvider>
      </body>
    </html>
  );
}
