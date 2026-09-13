import "./globals.css";
import Link from "next/link";

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header className="sticky top-0 z-30 border-b border-[#e8e5df]/80 bg-[#fbfaf7]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black tracking-[-.04em]">aptitude<span className="text-[#9b94bd]">.</span></Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#66707c] md:flex">
          <Link className="transition hover:text-[#6f6a8f]" href="/tests">Practice Tests</Link>
          <Link className="transition hover:text-[#6f6a8f]" href="/practice">Practice by Type</Link>
          <Link className="transition hover:text-[#6f6a8f]" href="/bookmarks">Bookmarks</Link>
          <Link className="transition hover:text-[#6f6a8f]" href="/history">Learning Center</Link>
        </nav>
        <Link href="/auth" className="rounded-full bg-[#6f6a8f] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">Sign in</Link>
      </div>
    </header>
    <main>{children}</main>
  </body></html>
}
