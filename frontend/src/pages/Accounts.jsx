import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/table.css";

function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accountType, setAccountType] = useState("Savings");
    const [clientName, setClientName] = useState("Apex Client");
    const [initialBalance, setInitialBalance] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/accounts/my-accounts", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAccounts(response.data);

            const name = localStorage.getItem("name");
            if (name) {
                setClientName(name);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await api.post(
                "/accounts/create",
                { 
                    account_type: accountType,
                    initial_balance: parseFloat(initialBalance || 0)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("Account opened successfully! Account Number: " + response.data.account_number);
            setMessageType("success");
            setIsModalOpen(false);
            setInitialBalance("");
            fetchAccounts();

            setTimeout(() => {
                setMessage("");
            }, 6000);
        } catch (error) {
            console.log(error);
            setMessage("Failed to open account. Please try again.");
            setMessageType("danger");
        }
    };

    const handleDeleteAccount = async (id) => {
        if (!window.confirm("Are you sure you want to delete this bank account? This action is permanent.")) {
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await api.delete(`/accounts/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage("Account deleted successfully!");
            setMessageType("success");
            fetchAccounts();
            setTimeout(() => setMessage(""), 6000);
        } catch (error) {
            console.error(error);
            setMessage("Failed to delete account.");
            setMessageType("danger");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Account Number copied to clipboard!");
    };

    const formatAccountNumber = (num) => {
        if (!num) return "";
        const str = num.toString();
        // Format: 1234 5678 90
        return str.replace(/(\d{4})(\d{4})(\d{2})/, "$1 $2 $3");
    };

    return (
        <MainLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="page-title mb-0">My Bank Accounts</h1>
                    <p className="text-secondary">View balances, copy account details, and create secondary accounts.</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Open New Account
                </button>
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

            <div className="accounts-grid">
                {accounts.length > 0 ? (
                    accounts.map((account) => (
                        <div
                            key={account.id}
                            className={`bank-card ${account.account_type.toLowerCase()}`}
                        >
                            <div className="bank-card-header">
                                <span className="bank-card-type">{account.account_type}</span>
                                <div className="bank-card-chip"></div>
                            </div>

                            <div className="bank-card-body">
                                <div
                                    className="bank-card-number"
                                    onClick={() => copyToClipboard(account.account_number)}
                                    title="Click to copy account number"
                                >
                                    {formatAccountNumber(account.account_number)}
                                </div>
                                <div className="bank-card-balance">
                                    ₹{account.balance?.toLocaleString() || "0.00"}
                                </div>
                            </div>

                            <div className="bank-card-footer">
                                <div>
                                    <div style={{ fontSize: "9px", opacity: 0.6 }}>CARD HOLDER</div>
                                    <div className="bank-card-holder">{clientName}</div>
                                </div>
                                <div className="d-flex flex-column align-items-end gap-1">
                                    <span className="bank-card-status">{account.status}</span>
                                    {account.balance === 0 && (
                                        <button
                                            className="btn btn-link text-white p-0 text-decoration-none small border-0 d-flex align-items-center"
                                            style={{ fontSize: "11px", opacity: 0.85 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAccount(account.id);
                                            }}
                                            title="Delete this empty account"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="me-1"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: "1/-1", padding: "48px", textAlign: "center", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px dashed var(--border-color)" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="mb-3"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        <h4 className="text-primary mb-1">No Accounts Found</h4>
                        <p className="text-secondary mb-3">You don't have any active bank accounts. Click above to open one.</p>
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Open First Account</button>
                    </div>
                )}
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-card">
                        <div className="modal-header">
                            <h3>Open a New Account</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => setIsModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleCreateAccount}>
                            <div className="form-group mb-3">
                                <label htmlFor="acc-type">Select Account Type</label>
                                <select
                                    id="acc-type"
                                    className="form-select"
                                    value={accountType}
                                    onChange={(e) => setAccountType(e.target.value)}
                                >
                                    <option value="Savings">Savings Account (Primary)</option>
                                    <option value="Current">Current Account (Business/Daily)</option>
                                </select>
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="init-balance">Initial Deposit (₹)</label>
                                <input
                                    id="init-balance"
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter initial amount, e.g. 5000"
                                    value={initialBalance}
                                    onChange={(e) => setInitialBalance(e.target.value)}
                                    min="0"
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => { setIsModalOpen(false); setInitialBalance(""); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Confirm & Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export default Accounts;