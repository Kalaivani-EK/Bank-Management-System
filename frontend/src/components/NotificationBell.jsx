import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/notification.css";

export const getNotificationColorClass = (type, title = "") => {
    const t = type ? type.toLowerCase() : "";
    const titleLower = title ? title.toLowerCase() : "";

    if (titleLower.includes("approved") || titleLower.includes("verified")) {
        return "type-green";
    }
    if (titleLower.includes("rejected")) {
        return "type-red";
    }
    if (titleLower.includes("review") || titleLower.includes("verification") || titleLower.includes("pending")) {
        return "type-yellow";
    }
    if (t === "support" || titleLower.includes("ticket")) {
        return "type-blue";
    }
    if (t === "loan") {
        if (titleLower.includes("approved")) return "type-green";
        if (titleLower.includes("rejected")) return "type-red";
        return "type-yellow";
    }
    if (t === "kyc") {
        if (titleLower.includes("verified") || titleLower.includes("approved")) return "type-green";
        if (titleLower.includes("rejected")) return "type-red";
        return "type-yellow";
    }
    return "type-gray";
};

export const getNotificationIcon = (type, title = "") => {
    const colorClass = getNotificationColorClass(type, title);
    if (colorClass === "type-green") return "✓";
    if (colorClass === "type-red") return "✕";
    if (colorClass === "type-yellow") return "⏳";
    if (colorClass === "type-blue") return "💬";
    return "🔔";
};

export const getRelativeTimeString = (dateString) => {
    if (!dateString) return "";
    let str = String(dateString);
    if (!str.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(str)) {
        str += "Z";
    }
    const date = new Date(str);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds >= 0 && diffSeconds < 60) {
        return "Just now";
    }
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes >= 0 && diffMinutes < 60) {
        return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    }

    const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === now.toDateString()) {
        return `Today, ${timeFormatted}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${timeFormatted}`;
    }

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeFormatted}`;
};

function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await api.get("/notifications/unread-count", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(res.data.unread_count || 0);
        } catch (err) {
            console.error("Error fetching unread count:", err);
        }
    }, []);

    const fetchRecentNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await api.get("/notifications?page=1&per_page=6", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            fetchRecentNotifications();
        }
    };

    const handleMarkAsRead = async (id, isRead, e) => {
        e.stopPropagation();
        if (isRead) return;
        try {
            const token = localStorage.getItem("token");
            const res = await api.put(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(res.data.unread_count || 0);
        } catch (err) {
            console.error("Error marking notification read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem("token");
            await api.put("/notifications/mark-all-read", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Error marking all read:", err);
        }
    };

    return (
        <div className="notification-bell-wrapper" ref={dropdownRef}>
            <button
                className="notification-bell-btn"
                onClick={toggleDropdown}
                title="Notifications"
                aria-label="Notifications"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <h6 className="notification-dropdown-title">Notifications</h6>
                        {unreadCount > 0 && (
                            <button
                                className="btn btn-link btn-sm text-decoration-none p-0 text-primary small fw-semibold"
                                onClick={handleMarkAllRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notification-dropdown-list">
                        {loading ? (
                            <div className="p-4 text-center text-muted small">Loading notifications...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map(n => {
                                const colorClass = getNotificationColorClass(n.type, n.title);
                                const icon = getNotificationIcon(n.type, n.title);
                                const relativeTime = getRelativeTimeString(n.created_at);

                                return (
                                    <div
                                        key={n.id}
                                        className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                                        onClick={(e) => handleMarkAsRead(n.id, n.is_read, e)}
                                    >
                                        <div className={`notification-type-icon ${colorClass}`}>
                                            {icon}
                                        </div>
                                        <div className="notification-body">
                                            <div className="notification-item-title">
                                                <span>{n.title}</span>
                                            </div>
                                            <p className="notification-item-message">{n.message}</p>
                                            <div className="notification-item-time">{relativeTime}</div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-muted small">No notifications yet.</div>
                        )}
                    </div>

                    <div className="notification-dropdown-footer">
                        <Link
                            to="/notifications"
                            className="notification-view-all-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            View All Notifications &rarr;
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
