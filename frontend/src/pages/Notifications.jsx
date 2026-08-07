import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import { getNotificationColorClass, getNotificationIcon, getRelativeTimeString } from "../components/NotificationBell";
import "../styles/notification.css";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [loading, setLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState("success");

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            let url = `/notifications?page=${page}&per_page=10`;
            if (search) url += `&q=${encodeURIComponent(search)}`;
            if (selectedType !== "all") url += `&type=${selectedType}`;
            if (selectedStatus !== "all") url += `&status=${selectedStatus}`;

            const response = await api.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(response.data.notifications || []);
            setTotal(response.data.total || 0);
            setPages(response.data.pages || 1);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, selectedType, selectedStatus]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const showAlert = (msg, type = "success") => {
        setAlertMsg(msg);
        setAlertType(type);
        setTimeout(() => setAlertMsg(""), 5000);
    };

    const handleMarkAsRead = async (id, isRead) => {
        if (isRead) return;
        try {
            const token = localStorage.getItem("token");
            const res = await api.put(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(res.data.unread_count || 0);
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem("token");
            await api.put("/notifications/mark-all-read", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showAlert("All notifications marked as read!");
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark all as read", error);
            showAlert("Failed to mark notifications as read.", "danger");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem("token");
            await api.delete(`/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showAlert("Notification deleted.");
            fetchNotifications();
        } catch (error) {
            console.error("Failed to delete notification", error);
            showAlert("Failed to delete notification.", "danger");
        }
    };

    return (
        <MainLayout>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="page-title mb-1">Notifications</h1>
                    <p className="text-secondary mb-0">Stay updated on your loan applications, KYC status, and support queries.</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold"
                        onClick={handleMarkAllRead}
                    >
                        ✓ Mark All as Read
                    </button>
                )}
            </div>

            {alertMsg && (
                <div className={`custom-alert custom-alert-${alertType} mb-4`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>{alertMsg}</span>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="card border-0 p-3 shadow-sm mb-4">
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-transparent border-end-0 text-muted">
                                🔍
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search notifications by title or message..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="col-md-4 col-sm-6">
                        <select
                            className="form-select"
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Types</option>
                            <option value="loan">Loan Notifications</option>
                            <option value="kyc">KYC Notifications</option>
                            <option value="support">Support Tickets</option>
                            <option value="account">Account</option>
                            <option value="transaction">Transactions</option>
                            <option value="general">General</option>
                        </select>
                    </div>

                    <div className="col-md-3 col-sm-6">
                        <select
                            className="form-select"
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="unread">Unread Only</option>
                            <option value="read">Read Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="card border-0 p-5 text-center text-muted shadow-sm">
                    Loading notifications...
                </div>
            ) : notifications.length > 0 ? (
                <div>
                    {notifications.map(n => {
                        const colorClass = getNotificationColorClass(n.type, n.title);
                        const icon = getNotificationIcon(n.type, n.title);
                        const relativeTime = getRelativeTimeString(n.created_at);

                        return (
                            <div
                                key={n.id}
                                className={`notification-card ${!n.is_read ? 'unread' : ''} d-flex align-items-start gap-3`}
                                onClick={() => handleMarkAsRead(n.id, n.is_read)}
                                style={{ cursor: n.is_read ? 'default' : 'pointer' }}
                            >
                                <div className={`notification-type-icon ${colorClass} mt-1`}>
                                    {icon}
                                </div>
                                <div className="flex-grow-1 min-w-0">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <h5 className="fw-bold fs-6 mb-0 text-dark me-2">{n.title}</h5>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`notification-card-badge ${colorClass}`}>
                                                {n.type}
                                            </span>
                                            <button
                                                className="btn btn-link text-danger p-0 border-0 ms-2"
                                                onClick={(e) => handleDelete(n.id, e)}
                                                title="Delete notification"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <p className="notification-card-message mb-2">{n.message}</p>
                                    <div className="notification-card-time">{relativeTime}</div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <span className="text-secondary small">
                                Showing page {page} of {pages} ({total} items)
                            </span>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    &laquo; Previous
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={page >= pages}
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                >
                                    Next &raquo;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card border-0 p-5 text-center shadow-sm">
                    <div className="fs-1 mb-2">🔕</div>
                    <h5 className="fw-bold">No Notifications Found</h5>
                    <p className="text-secondary small">There are no notifications matching your current filters or search criteria.</p>
                </div>
            )}
        </MainLayout>
    );
}

export default Notifications;
