import "./globals.css";
import "./editorial.css";
import "./test-workspace.css";
import Link from "next/link";
import AccountMenu from "../components/account-menu";

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand" aria-label="Aptitude with Derek">
          <span className="brand-main">aptitude</span>
          <span className="brand-sub">with Derek</span>
        </Link>
        <nav className="main-nav" aria-label="Primary navigation">
          <Link href="/tests">Practice Tests</Link>
          <Link href="/practice">Practice by Type</Link>
          <Link href="/dashboard">Progression Dashboard</Link>
          <Link href="/bookmarks">Bookmark</Link>
        </nav>
        <AccountMenu />
      </div>
    </header>
    <main>{children}</main>
  </body></html>
}
