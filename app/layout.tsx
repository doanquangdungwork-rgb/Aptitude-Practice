import "./globals.css";
import "./editorial.css";
import "./test-workspace.css";
import "./test-layout.css";
import Link from "next/link";
import AccountMenu from "../components/account-menu";
import MainNav from "../components/main-nav";

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand" aria-label="Aptitude with Derek">
          <span className="brand-main">aptitude</span>
          <span className="brand-sub">with Derek</span>
        </Link>
        <MainNav />
        <AccountMenu />
      </div>
    </header>
    <main>{children}</main>
  </body></html>
}
