import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";
import "../styles/dashboard.css";

const COLORS = ["#0d6efd", "#20c997", "#ffc107", "#dc3545"];

function AdminDashboard() {
    const [summary, setSummary] = useState({
        total_deposits: 0,
        total_withdrawals: 0,
        total_transfers: 0,
        total_customers: 0,
        active_accounts: 0,
        loan_applications: 0,
        approved_loans: 0,
        open_tickets: 0
    });
    const [trendData, setTrendData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [loanBreakdownData, setLoanBreakdownData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const [summaryRes, trendRes, distRes, loanRes] = await Promise.all([
                    api.get("/admin/dashboard-summary", { headers }),
                    api.get("/admin/transaction-trend", { headers }),
                    api.get("/admin/account-distribution", { headers }),
                    api.get("/admin/loan-breakdown", { headers })
                ]);

                if (summaryRes?.data) setSummary(summaryRes.data);
                if (trendRes?.data) setTrendData(trendRes.data);
                if (distRes?.data) setDistributionData(distRes.data);
                if (loanRes?.data) setLoanBreakdownData(loanRes.data);
            } catch (error) {
                console.error("Error loading admin dashboard metrics", error);
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
                        <h1 className="h2 fw-bold mb-1">Admin Control Panel</h1>
                        <p className="text-secondary mb-0">System monitoring, KYC validations, loan approvals, and customer support portal.</p>
                    </div>
                    <div className="badge bg-success px-3 py-2 fs-6">
                        System Online
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-4">
                    {/* Card 1 */}
                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(6, 78, 59, 0.85) 0%, rgba(16, 185, 129, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-uppercase text-white-50">Total Deposits</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-1 fs-4 text-white">₹{summary.total_deposits?.toLocaleString()}</h2>
                            <span className="small text-white-50">Sum Credit Logs</span>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(136, 19, 55, 0.85) 0%, rgba(225, 29, 72, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-uppercase text-white-50">Total Withdrawals</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-1 fs-4 text-white">₹{summary.total_withdrawals?.toLocaleString()}</h2>
                            <span className="small text-white-50">Sum Debit Logs</span>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(59, 130, 246, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-uppercase text-white-50">Total Transfers</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="17 1 21 5 17 9"/><line x1="3" y1="11" x2="21" y2="11"/><line x1="19" y1="21" x2="5" y2="21"/><polyline points="7 13 3 17 7 21"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-1 fs-4 text-white">₹{summary.total_transfers?.toLocaleString()}</h2>
                            <span className="small text-white-50">Unique Transfer Volumes</span>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(88, 28, 135, 0.85) 0%, rgba(139, 92, 246, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-uppercase text-white-50">Total Customers</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-1 fs-4 text-white">{summary.total_customers}</h2>
                            <span className="small text-white-50">Clients Registered</span>
                        </div>
                    </div>

                    {/* Card 5 */}
                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(13, 148, 136, 0.85) 0%, rgba(45, 212, 191, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-uppercase text-white-50">Active Accounts</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-1 fs-4 text-white">{summary.active_accounts}</h2>
                            <span className="small text-white-50">Active Bank Holdings</span>
                        </div>
                    </div>

                    {/* Card 6 */}
                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(120, 53, 4, 0.85) 0%, rgba(245, 158, 11, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-uppercase text-white-50">Loan Applications</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-1 fs-4 text-white">{summary.loan_applications}</h2>
                            <span className="small text-white-50">Total Submissions</span>
                        </div>
                    </div>

                    {/* Card 7 */}
                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(6, 95, 70, 0.85) 0%, rgba(52, 211, 153, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-uppercase text-white-50">Approved Loans</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-1 fs-4 text-white">{summary.approved_loans}</h2>
                            <span className="small text-white-50">Capital Disbursed</span>
                        </div>
                    </div>

                    {/* Card 8 */}
                    <div className="col">
                        <div className="card h-100 border-0 p-4 shadow-sm text-white" style={{ background: "linear-gradient(135deg, rgba(153, 27, 27, 0.85) 0%, rgba(248, 113, 113, 0.9) 100%)", border: "1px solid rgba(255, 255, 255, 0.15) !important" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-uppercase text-white-50">Open Support Tickets</span>
                                <div className="card-metric-icon bg-white bg-opacity-20 text-white rounded-3 d-flex align-items-center justify-content-center">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-1 fs-4 text-white">{summary.open_tickets}</h2>
                            <span className="small text-white-50">Unresolved Queries</span>
                        </div>
                    </div>
                </div>

                {/* Recharts Graphical Visualizations */}
                <div className="row g-4 mb-4">
                    {/* Line Chart */}
                    <div className="col-lg-8 col-12">
                        <div className="card border-0 p-4 shadow-sm h-100">
                            <h3 className="h5 fw-bold text-primary mb-3">Transaction Volume Trend</h3>
                            <div style={{ width: "100%", height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                                        <YAxis stroke="var(--text-muted)" fontSize={11} />
                                        <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                        <Legend verticalAlign="top" height={36} />
                                        <Line type="monotone" dataKey="count" name="Transaction Count" stroke="#0d6efd" strokeWidth={3} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="col-lg-4 col-12">
                        <div className="card border-0 p-4 shadow-sm h-100 d-flex flex-column justify-content-between">
                            <h3 className="h5 fw-bold text-primary mb-3">Savings vs Current Accounts</h3>
                            <div style={{ width: "100%", height: 260 }} className="d-flex align-items-center justify-content-center">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    {/* Bar Chart */}
                    <div className="col-12">
                        <div className="card border-0 p-4 shadow-sm">
                            <h3 className="h5 fw-bold text-primary mb-3">Loan Status Breakdown</h3>
                            <div style={{ width: "100%", height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={loanBreakdownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                        <XAxis dataKey="status" stroke="var(--text-muted)" fontSize={11} />
                                        <YAxis stroke="var(--text-muted)" fontSize={11} />
                                        <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                        <Legend verticalAlign="top" height={36} />
                                        <Bar dataKey="count" name="Loans Count" fill="#ffc107" radius={[4, 4, 0, 0]}>
                                            {loanBreakdownData.map((entry, index) => {
                                                let color = "#ffc107"; // Pending
                                                if (entry.status === "Approved") color = "#198754";
                                                if (entry.status === "Rejected") color = "#dc3545";
                                                return <Cell key={`cell-${index}`} fill={color} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="row g-4">
                    <div className="col-lg-8 col-12">
                        <div className="card border-0 p-4 shadow-sm h-100">
                            <h3 className="h5 fw-bold mb-4">Administrative Shortcuts</h3>
                            <div className="row g-3">
                                <div className="col-md-4 col-12">
                                    <a href="/admin-customers" className="btn btn-primary w-100 py-3 d-block text-center text-white text-decoration-none rounded-3 fw-semibold">Manage Customers</a>
                                </div>
                                <div className="col-md-4 col-12">
                                    <a href="/admin-loans" className="btn btn-primary w-100 py-3 d-block text-center text-white text-decoration-none rounded-3 fw-semibold">Approve Loans</a>
                                </div>
                                <div className="col-md-4 col-12">
                                    <a href="/admin-tickets" className="btn btn-primary w-100 py-3 d-block text-center text-white text-decoration-none rounded-3 fw-semibold">Resolve Tickets</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-4 col-12">
                        <div className="card border-0 p-4 shadow-sm h-100 d-flex flex-column justify-content-center">
                            <h3 className="h5 fw-bold mb-3">Security Standard</h3>
                            <p className="small text-secondary mb-0">
                                All actions performed are logged to the security audit stream. Ensure compliance with internal bank protocols before confirming loan requests or KYC status approvals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default AdminDashboard;