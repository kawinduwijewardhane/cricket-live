import "./globals.css";

export const metadata = {
  title: "Cricket Live - Watch Live Matches",
  description: "Watch live cricket matches streaming free",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="bg-green-700 text-white px-4 py-3 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="text-lg font-bold tracking-tight">
              Cricket Live
            </a>
            <span className="text-xs opacity-80">Live Streams</span>
          </div>
        </header>
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4">
          {children}
        </main>
        <footer className="bg-gray-800 text-gray-400 text-center text-xs py-3">
          Cricket Live &copy; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
