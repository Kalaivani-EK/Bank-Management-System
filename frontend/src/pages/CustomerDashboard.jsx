import { useEffect, useState } from "react";
import api from "../services/api";

import MainLayout from "../layouts/MainLayout";
import "../styles/dashboard.css";

function CustomerDashboard() {
    const [dashboard, setDashboard] = useState({
        balance: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        total_loans: 0,
        open_tickets: 0
    });
    const [profile, setProfile] = useState({
        name: "Valued Customer",
        email: "customer@bank.com",
        phone: "-",
        address: "-",
        kyc_status: "Pending"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const [dashResponse, profileResponse] = await Promise.all([
                    api.get("/customer/dashboard-summary", { headers }),
                    api.get("/customer/profile", { headers }).catch(e => {
                        console.error("Profile fetch error, using defaults", e);
                        return { data: profile };
                    })
                ]);

                if (dashResponse?.data) {
                    setDashboard(dashResponse.data);
                }
                if (profileResponse?.data) {
                    setProfile(profileResponse.data);
                    localStorage.setItem("email", profileResponse.data.email);
                    localStorage.setItem("name", profileResponse.data.name);
                }
            } catch (error) {
                console.log("Error loading dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <MainLayout>
            <div className="container-fluid p-0">
                <div className="dashboard-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <h1 className="h2 fw-bold mb-1">Welcome back, {profile.name.split(" ")[0]}</h1>
                        <p className="text-secondary mb-0">Here is a summary of your financial status today.</p>
                    </div>
                    <div className={`badge ${profile.kyc_status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2 fs-6`}>
                        KYC Status: {profile.kyc_status}
                    </div>
                </div>

                {/* Profile Showcase Banner */}
                <div className="profile-banner card border-0 p-4 mb-4 shadow-sm">
                    <div className="profile-details d-flex align-items-center gap-3">
                        <div className="profile-icon d-flex align-items-center justify-content-center">
                            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <div className="profile-info">
                            <h3 className="h5 fw-bold mb-1">{profile.name}</h3>
                            <div className="profile-meta d-flex flex-wrap gap-3">
                                <span className="d-flex align-items-center gap-1">
                                    <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    {profile.email}
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    {profile.phone}
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {profile.address}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="row row-cols-1 row-cols-md-3 row-cols-xl-5 g-4 mb-4">
                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(6, 78, 59, 0.85) 0%, rgba(16, 185, 129, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-white-50">TOTAL BALANCE</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-2 fs-4 text-white">₹{dashboard.balance?.toLocaleString() || "0"}</h2>
                            <span className="small text-white-50">Aggregated Holdings</span>
                        </div>
                    </div>

                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(59, 130, 246, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-white-50">TOTAL DEPOSITS</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-2 fs-4 text-white">₹{dashboard.total_deposits?.toLocaleString() || "0"}</h2>
                            <span className="small text-white-50">Sum Credit Logs</span>
                        </div>
                    </div>

                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(136, 19, 55, 0.85) 0%, rgba(225, 29, 72, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-white-50">TOTAL WITHDRAWALS</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-2 fs-4 text-white">₹{dashboard.total_withdrawals?.toLocaleString() || "0"}</h2>
                            <span className="small text-white-50">Sum Debit Logs</span>
                        </div>
                    </div>

                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(120, 53, 4, 0.85) 0%, rgba(245, 158, 11, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-white-50">TOTAL LOANS</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-2 fs-4 text-white">{dashboard.total_loans}</h2>
                            <span className="small text-white-50">Active Facilities</span>
                        </div>
                    </div>

                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(88, 28, 135, 0.85) 0%, rgba(139, 92, 246, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-white-50">OPEN TICKETS</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-2 fs-4 text-white">{dashboard.open_tickets}</h2>
                            <span className="small text-white-50">Pending Resolution</span>
                        </div>
                    </div>
                </div>

                {/* Financial Visualizations panel */}
                <div className="row g-4">
                    <div className="col-12">
                        <div className="card border-0 p-4 shadow-sm h-100">
                            <h3 className="h5 fw-bold mb-4">Balance Flow History</h3>
                            <div className="chart-placeholder d-flex align-items-end justify-content-between">
                                {(() => {
                                    const dummyChartData = [
                                        { month: "Jan", balance: 0 },
                                        { month: "Feb", balance: 0 },
                                        { month: "Mar", balance: 0 },
                                        { month: "Apr", balance: 0 },
                                        { month: "May", balance: 0 },
                                        { month: "Jun", balance: 0 },
                                        { month: "Jul", balance: 0 }
                                    ];
                                    const chartData = dashboard.chart_data && dashboard.chart_data.length > 0 ? dashboard.chart_data : dummyChartData;
                                    const maxBalance = Math.max(...chartData.map(d => d.balance), 0);
                                    const barColors = [
                                        "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
                                        "linear-gradient(180deg, #10b981 0%, #047857 100%)",
                                        "linear-gradient(180deg, #f59e0b 0%, #b45309 100%)",
                                        "linear-gradient(180deg, #ec4899 0%, #be185d 100%)",
                                        "linear-gradient(180deg, #8b5cf6 0%, #5b21b6 100%)",
                                        "linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)",
                                        "linear-gradient(180deg, #e11d48 0%, #9f1239 100%)"
                                    ];
                                    return chartData.map((item, idx) => {
                                        const heightPercent = maxBalance > 0 ? (item.balance / maxBalance) * 90 + 5 : 5;
                                        return (
                                            <div 
                                                key={item.month}
                                                className="chart-bar" 
                                                style={{
                                                    height: `${heightPercent}%`, 
                                                    background: barColors[idx % barColors.length]
                                                }} 
                                                data-label={item.month} 
                                                title={`Balance: ₹${item.balance.toLocaleString()}`}
                                            ></div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default CustomerDashboard;