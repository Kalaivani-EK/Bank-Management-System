import { Link, useLocation } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import "../styles/layout.css";

function MainLayout({ children }) {
    const role = localStorage.getItem("role") || "customer";
    const email = localStorage.getItem("email") || (role === "admin" ? "admin@bank.com" : "customer@bank.com");
    const name = role === "admin" ? "System Admin" : "Bank Customer";
    const location = useLocation();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    // Helper to get initials
    const getInitials = (n) => {
        return n.split(" ").map(w => w[0]).join("").toUpperCase();
    };

    return (
        <div className="layout">
            <div className="sidebar d-flex flex-column justify-content-between">
                <div>
                    <div className="sidebar-header d-flex align-items-center mb-4">
                        <h1 className="m-0">FINOVA</h1>
                    </div>

                    <div className="sidebar-nav d-flex flex-column gap-2">
                        {role === "customer" && (
                            <>
                                <Link to="/dashboard" className={`${isActive("/dashboard")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                                    Dashboard
                                </Link>

                                <Link to="/accounts" className={`${isActive("/accounts")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                                    Accounts
                                </Link>

                                <Link to="/transactions" className={`${isActive("/transactions")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8v12M17 20l4-4M17 20l-4-4"/></svg>
                                    Transactions
                                </Link>

                                <Link to="/deposit" className={`${isActive("/deposit")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    Deposit
                                </Link>

                                <Link to="/withdraw" className={`${isActive("/withdraw")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    Withdraw
                                </Link>

                                <Link to="/transfer" className={`${isActive("/transfer")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><path d="M17 3L21 7L17 11M7 21L3 17L7 13M21 7H3M3 17H21"/></svg>
                                    Transfer
                                </Link>

                                <Link to="/loans" className={`${isActive("/loans")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Loans
                                </Link>

                                <Link to="/support" className={`${isActive("/support")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    Support
                                </Link>

                                <Link to="/notifications" className={`${isActive("/notifications")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                    Notifications
                                </Link>
                            </>
                        )}

                        {role === "admin" && (
                            <>
                                <Link to="/admin-dashboard" className={`${isActive("/admin-dashboard")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                                    Admin Dashboard
                                </Link>

                                <Link to="/admin-customers" className={`${isActive("/admin-customers")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    Customers
                                </Link>

                                <Link to="/admin-loans" className={`${isActive("/admin-loans")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    Loans Approval
                                </Link>

                                <Link to="/admin/accounts" className={`${isActive("/admin/accounts")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                                    Account Management
                                </Link>

                                <Link to="/admin/transactions" className={`${isActive("/admin/transactions")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
                                    Transactions
                                </Link>

                                <Link to="/admin-tickets" className={`${isActive("/admin-tickets")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    Tickets
                                </Link>

                                <Link to="/admin-settings" className={`${isActive("/admin-settings")} d-flex align-items-center gap-3`}>
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                    Bank Settings
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <Link to="/profile" className="text-decoration-none text-reset">
                        <div className="sidebar-user d-flex align-items-center gap-3 p-3 mb-3 cursor-pointer" title="Click to view & edit your profile">
                            <div className="user-avatar d-flex align-items-center justify-content-center">{getInitials(name)}</div>
                            <div className="user-info flex-grow-1 min-w-0">
                                <div className="user-name text-truncate">{name}</div>
                                <div className="user-role">{role}</div>
                            </div>
                        </div>
                    </Link>

                    <button
                        className="logout-btn d-flex align-items-center justify-content-center gap-2"
                        onClick={handleLogout}
                    >
                        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                        Logout
                    </button>
                </div>
            </div>

            <div className="content">
                {role === "customer" && (
                    <div className="d-flex justify-content-end align-items-center mb-3">
                        <NotificationBell />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}


export default MainLayout;
