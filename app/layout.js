import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import FirebaseProvider from "@/components/FirebaseProvider";

export const metadata = {
  title: "AI Career Coach",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        {/* Preload fonts to prevent loading issues */}
        <link
          rel="preload"
          href="/fonts/Coldiac.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/ppmori-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Sk-Modernist-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <FirebaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            <footer className="bg-black py-10 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-4">
          <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide leading-relaxed">
            We promise that it won't just be a tool- it will grow into a trusted partner shaping every user's career tomorrow.
          </p>
        </div>
        <div className="flex justify-end">
          <p className="text-gray-500 text-xs italic font-light">
            Shiva
            Team UNIPATH
          </p>
        </div>
      </div>
    </footer>
          </ThemeProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
