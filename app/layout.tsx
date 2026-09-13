import "./globals.css";
import Link from "next/link";
import AccountMenu from "../components/account-menu";

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand">aptitude<span>.</span></Link>
        <nav className="main-nav">
          <Link href="/tests">Practice Tests</Link>
          <Link href="/practice">Practice by Type</Link>
          <Link href="/bookmarks">Bookmarks</Link>
          <Link href="/history">Learning Center</Link>
        </nav>
        <AccountMenu />
      </div>
    </header>
    <main>{children}</main>
  </body></html>
}
