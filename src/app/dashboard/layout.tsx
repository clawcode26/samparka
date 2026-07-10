"use client";

import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  PenSquare, 
  FileText, 
  CheckSquare, 
  Users, 
  LogOut,
  ShieldAlert,
  Menu,
  MessageSquare
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading, logout } = useAuth();

  // Redirect if not logged in or email not verified
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!user.emailVerified) {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Handle unauthorized access for reporters attempting to access editor/manager pages
  const isReporter = role === "reporter";
  const isAccessingRestricted = 
    pathname.startsWith("/dashboard/editor") || 
    pathname.startsWith("/dashboard/manager");

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "var(--neutral-50)", fontFamily: "var(--font-body), sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--brand-color)", marginBottom: "8px" }}>Sampark Workspace</div>
          <div style={{ fontSize: "14px", color: "var(--text-light)" }}>Loading workspace context...</div>
        </div>
      </div>
    );
  }

  if (!user || !user.emailVerified) {
    return null; // Redirect handled by useEffect
  }

  // If user is reporter but trying to access manager/editor routes
  if (isReporter && isAccessingRestricted) {
    return (
      <div className={styles.dashboardShell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.brand}>Sampark<span>Workspace</span></div>
          </div>
          <nav className={styles.navContainer}>
            <div className={styles.navSectionLabel}>Reporter</div>
            <Link href="/dashboard/reporter" className={`${styles.navLink} ${pathname === '/dashboard/reporter' ? styles.active : ''}`}>
              <FileText size={18} /> My Articles
            </Link>
            <Link href="/dashboard/reporter/compose" className={`${styles.navLink} ${pathname === '/dashboard/reporter/compose' ? styles.active : ''}`}>
              <PenSquare size={18} /> Write Article
            </Link>
          </nav>
          <div className={styles.userMenu}>
            <div className={styles.avatar}>{user.displayName ? user.displayName[0].toUpperCase() : "U"}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.displayName || "User"}</span>
              <span className={styles.userRole}>Reporter</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </aside>
        <div className={styles.mainContent}>
          <header className={styles.topHeader}>
            <div className={styles.pageTitle}>Access Denied</div>
            <div className={styles.headerActions}>
              <Link href="/" className={styles.navLink}>
                Exit to Newspaper
              </Link>
            </div>
          </header>
          <main className={styles.contentArea} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", maxWidth: "400px", padding: "var(--space-24)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", backgroundColor: "#ffffff" }}>
              <ShieldAlert size={48} color="var(--brand-color)" style={{ marginBottom: "var(--space-16)" }} />
              <h2 style={{ fontSize: "20px", marginBottom: "var(--space-8)" }}>Restricted Access</h2>
              <p style={{ fontSize: "14px", color: "var(--text-light)", marginBottom: "var(--space-24)" }}>
                Reporters are only permitted to write articles and manage their own drafts.
              </p>
              <Link href="/dashboard/reporter" className={styles.navLink} style={{ display: "inline-block", background: "var(--brand-color)", color: "#fff", padding: "8px 16px", borderRadius: "var(--radius)", fontWeight: 600 }}>
                Go to My Articles
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardShell}>
      
      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className={styles.sidebarBackdrop} 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarActive : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>Sampark<span>Workspace</span></div>
        </div>
        
        <nav className={styles.navContainer}>
          {/* Reporter role sees My Articles & Compose */}
          <div className={styles.navSectionLabel}>Reporter</div>
          <Link 
            href="/dashboard/reporter" 
            className={`${styles.navLink} ${pathname === '/dashboard/reporter' ? styles.active : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FileText size={18} /> My Articles
          </Link>
          <Link 
            href="/dashboard/reporter/compose" 
            className={`${styles.navLink} ${pathname === '/dashboard/reporter/compose' ? styles.active : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <PenSquare size={18} /> Write Article
          </Link>

          {/* Admin role sees Editor & Manager tabs */}
          {!isReporter && (
            <>
              <div className={styles.navSectionLabel} style={{ marginTop: '16px' }}>Editor</div>
              <Link 
                href="/dashboard/editor" 
                className={`${styles.navLink} ${pathname === '/dashboard/editor' ? styles.active : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <CheckSquare size={18} /> Review Queue
              </Link>

              <div className={styles.navSectionLabel} style={{ marginTop: '16px' }}>Manager</div>
              <Link 
                href="/dashboard/manager" 
                className={`${styles.navLink} ${pathname === '/dashboard/manager' ? styles.active : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Users size={18} /> Staff Directory
              </Link>
              <Link 
                href="/dashboard/manager/onboard" 
                className={`${styles.navLink} ${pathname === '/dashboard/manager/onboard' ? styles.active : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <LayoutDashboard size={18} /> Onboard Staff
              </Link>
              <Link 
                href="/dashboard/manager/grievances" 
                className={`${styles.navLink} ${pathname === '/dashboard/manager/grievances' ? styles.active : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <MessageSquare size={18} /> Grievances
              </Link>
            </>
          )}
        </nav>

        <div className={styles.userMenu}>
          <div className={styles.avatar}>{user.displayName ? user.displayName[0].toUpperCase() : "U"}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.displayName || "User"}</span>
            <span className={styles.userRole}>{role === "admin" ? "System Admin" : "Reporter"}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Sign Out" style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-light)", cursor: "pointer" }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className={styles.hamburgerBtn} 
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Toggle Navigation"
            >
              <Menu size={20} />
            </button>
            <div className={styles.pageTitle}>Dashboard</div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/" className={styles.navLink}>
              Exit to Newspaper
            </Link>
          </div>
        </header>
        
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>

    </div>
  );
}
