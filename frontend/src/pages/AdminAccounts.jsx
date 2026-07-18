import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/table.css";

function AdminAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [customerId, setCustomerId] = useState("");
    const [accountType, setAccountType] = useState("Savings");
    const [initialBalance, setInitialBalance] = useState("");
    
    const [depositAccountId, setDepositAccountId] = useState("");
    const [depositAmount, setDepositAmount] = useState("");

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/admin/accounts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAccounts(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.post("/admin/create-account", {
                customer_id: parseInt(customerId),
                account_type: accountType,
                initial_balance: parseFloat(initialBalance || 0)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage("Bank account created successfully!");
            setMessageType("success");
            setCustomerId("");
            setInitialBalance("");
            fetchAccounts();
            
            setTimeout(() => setMessage(""), 6000);
        } catch (error) {
            console.error(error);
            setMessage("Failed to create account. Verify Customer ID.");
            setMessageType("danger");
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.post("/admin/deposit", {
                account_id: parseInt(depositAccountId),
                amount: parseFloat(depositAmount)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage("Funds deposited successfully!");
            setMessageType("success");
            setDepositAccountId("");
            setDepositAmount("");
            fetchAccounts();

            setTimeout(() => setMessage(""), 6000);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to deposit funds.");
            setMessageType("danger");
        }
    };

    const handleStatusUpdate = async (id, action) => {
        try {
            const token = localStorage.getItem("token");
            await api.put(`/admin/${action}-account/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage(`Account status updated: ${action}ed`);
            setMessageType("success");
            fetchAccounts();

            setTimeout(() => setMessage(""), 6000);
        } catch (error) {
            console.error(error);
            setMessage(`Failed to perform ${action} on account.`);
            setMessageType("danger");
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Active": return "bg-success text-white";
            case "Frozen": return "bg-warning text-dark";
            case "Closed": return "bg-danger text-white";
            default: return "bg-secondary text-white";
        }
    };

    return (
        <MainLayout>
            <div className="mb-4">
                <h1 className="page-title">Account Management</h1>
                <p className="text-secondary">Administer customer accounts, view holdings, switch status states, and deposit funds.</p>
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
                {/* Left Panel: Accounts list */}
                <div className="col-lg-8">
                    <div className="card border-0 p-4 shadow-sm h-100">
                        <h3 className="text-primary mb-3">All Customer Accounts</h3>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Acc Number</th>
                                        <th>Customer ID</th>
                                        <th>Type</th>
                                        <th>Balance</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.length > 0 ? (
                                        accounts.map((acc) => (
                                            <tr key={acc.id}>
                                                <td>{acc.id}</td>
                                                <td className="fw-semibold text-primary">{acc.account_number}</td>
                                                <td>Client #{acc.customer_id}</td>
                                                <td>{acc.account_type}</td>
                                                <td className="fw-bold">₹{acc.balance?.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${getStatusClass(acc.status)} px-2 py-1.5`}>
                                                        {acc.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        {acc.status !== "Active" && acc.status !== "Closed" && (
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleStatusUpdate(acc.id, "activate")}
                                                            >
                                                                Activate
                                                            </button>
                                                        )}
                                                        {acc.status === "Active" && (
                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                onClick={() => handleStatusUpdate(acc.id, "freeze")}
                                                            >
                                                                Freeze
                                                            </button>
                                                        )}
                                                        {acc.status !== "Closed" && (
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleStatusUpdate(acc.id, "close")}
                                                            >
                                                                Close
                                                            </button>
                                                        )}
                                                        {acc.status === "Closed" && (
                                                            <span className="text-secondary small">Inactive</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-4">
                                                No customer accounts found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Creation and Deposit Forms */}
                <div className="col-lg-4 d-flex flex-column gap-4">
                    {/* Form 1: Open Account */}
                    <div className="card border-0 p-4 shadow-sm">
                        <h3 className="text-primary mb-3">Open Bank Account</h3>
                        <form onSubmit={handleCreateAccount}>
                            <div className="mb-3">
                                <label htmlFor="cust-id" className="form-label">Customer ID</label>
                                <input
                                    id="cust-id"
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter client ID"
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="ac-type" className="form-label">Account Type</label>
                                <select
                                    id="ac-type"
                                    className="form-select"
                                    value={accountType}
                                    onChange={(e) => setAccountType(e.target.value)}
                                >
                                    <option value="Savings">Savings Account</option>
                                    <option value="Current">Current Account</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="init-bal" className="form-label">Initial Balance (₹)</label>
                                <input
                                    id="init-bal"
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter starting balance"
                                    value={initialBalance}
                                    onChange={(e) => setInitialBalance(e.target.value)}
                                    min="0"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-100 mt-2">
                                Open Account
                            </button>
                        </form>
                    </div>

                    {/* Form 2: Deposit Funds */}
                    <div className="card border-0 p-4 shadow-sm">
                        <h3 className="text-primary mb-3">Deposit Funds (Admin)</h3>
                        <form onSubmit={handleDeposit}>
                            <div className="mb-3">
                                <label htmlFor="dep-acc-id" className="form-label">Account ID</label>
                                <input
                                    id="dep-acc-id"
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter account ID"
                                    value={depositAccountId}
                                    onChange={(e) => setDepositAccountId(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="dep-amount" className="form-label">Amount (₹)</label>
                                <input
                                    id="dep-amount"
                                    type="number"
                                    className="form-control"
                                    placeholder="Amount to deposit"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-success w-100 mt-2 text-white">
                                Deposit Funds
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default AdminAccounts;
