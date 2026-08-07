import { useState, useEffect } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

function AdminSettings() {
    const [minDeposit, setMinDeposit] = useState("");
    const [currentMinDeposit, setCurrentMinDeposit] = useState(1000);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/admin/settings", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const val = response.data.minimum_initial_deposit;
            setCurrentMinDeposit(val);
            setMinDeposit(val.toString());
            setUpdatedAt(response.data.updated_at);
        } catch (error) {
            console.error("Failed to fetch settings", error);
            setMessage("Failed to load bank settings.");
            setMessageType("danger");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        const numVal = parseFloat(minDeposit);
        if (isNaN(numVal) || numVal < 0) {
            setMessage("Please enter a valid positive deposit amount.");
            setMessageType("danger");
            return;
        }

        setIsSaving(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            const response = await api.put(
                "/admin/settings",
                { minimum_initial_deposit: numVal },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(response.data.message || "Bank settings updated successfully!");
            setMessageType("success");
            setCurrentMinDeposit(response.data.minimum_initial_deposit);
            setUpdatedAt(response.data.updated_at);
            setTimeout(() => setMessage(""), 5000);
        } catch (error) {
            const errText = error.response?.data?.message || "Failed to update settings. Please try again.";
            setMessage(errText);
            setMessageType("danger");
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        return new Date(isoString).toLocaleString();
    };

    return (
        <MainLayout>
            <div className="container-fluid p-0">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h2 fw-bold mb-1">Bank Settings</h1>
                        <p className="text-secondary mb-0">Configure system-wide parameters and account policies.</p>
                    </div>
                    <div className="badge bg-primary px-3 py-2 fs-6">
                        System Configuration
                    </div>
                </div>

                {message && (
                    <div className={`custom-alert custom-alert-${messageType} mb-4`}>
                        {messageType === "success" ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        )}
                        <span>{message}</span>
                    </div>
                )}

                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm p-4" style={{ background: "var(--bg-surface)", borderRadius: "var(--border-radius)" }}>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-3 bg-success bg-opacity-10 text-success rounded-3">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M12 15h.01"/></svg>
                                </div>
                                <div>
                                    <h3 className="h5 fw-bold mb-0">Initial Account Deposit Policy</h3>
                                    <span className="small text-muted">Active Global Configuration</span>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveSettings}>
                                    <div className="mb-4">
                                        <label htmlFor="min-initial-deposit-input" className="form-label fw-semibold">
                                            Minimum Initial Deposit (₹)
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light fw-bold text-muted">₹</span>
                                            <input
                                                id="min-initial-deposit-input"
                                                type="number"
                                                className="form-control form-control-lg"
                                                placeholder="e.g. 1000"
                                                value={minDeposit}
                                                onChange={(e) => setMinDeposit(e.target.value)}
                                                min="0"
                                                step="100"
                                                required
                                            />
                                        </div>
                                        <div className="form-text text-muted mt-2">
                                            Customers must deposit at least this amount during new bank account creation. Updates take effect immediately for all new accounts.
                                        </div>
                                    </div>

                                    <div className="p-3 bg-light rounded-3 mb-4 d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="small text-muted">Currently Active Minimum:</div>
                                            <div className="fs-5 fw-bold text-success">₹{currentMinDeposit?.toLocaleString()}</div>
                                        </div>
                                        <div className="text-end">
                                            <div className="small text-muted">Last Updated:</div>
                                            <div className="small fw-medium text-dark">{formatDate(updatedAt)}</div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                                Save Settings
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm p-4 h-100" style={{ background: "var(--bg-surface)", borderRadius: "var(--border-radius)" }}>
                            <h3 className="h5 fw-bold mb-3">Policy Enforcement Details</h3>
                            <ul className="list-group list-group-flush border-0">
                                <li className="list-group-item bg-transparent border-0 px-0 d-flex gap-3 align-items-start mb-2">
                                    <div className="badge bg-success rounded-circle p-2 mt-1">1</div>
                                    <div>
                                        <h4 className="h6 fw-bold mb-1">Database Storage</h4>
                                        <p className="small text-secondary mb-0">Configurations are saved directly in the SQL database, avoiding hardcoded constants.</p>
                                    </div>
                                </li>
                                <li className="list-group-item bg-transparent border-0 px-0 d-flex gap-3 align-items-start mb-2">
                                    <div className="badge bg-success rounded-circle p-2 mt-1">2</div>
                                    <div>
                                        <h4 className="h6 fw-bold mb-1">Real-time Validation</h4>
                                        <p className="small text-secondary mb-0">Any changes made here apply immediately to account registrations without requiring a server reboot.</p>
                                    </div>
                                </li>
                                <li className="list-group-item bg-transparent border-0 px-0 d-flex gap-3 align-items-start">
                                    <div className="badge bg-success rounded-circle p-2 mt-1">3</div>
                                    <div>
                                        <h4 className="h6 fw-bold mb-1">Initial Deposit Transaction</h4>
                                        <p className="small text-secondary mb-0">Every successful account opening creates an explicit "Initial Deposit" transaction record for auditing.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default AdminSettings;
