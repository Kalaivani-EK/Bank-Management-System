import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

function Transfer() {
    const [accounts, setAccounts] = useState([]);
    const [selectedSenderId, setSelectedSenderId] = useState("");
    const [receiverAccountNumber, setReceiverAccountNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/accounts/my-accounts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Show only Active accounts for transfers
            const activeAccs = response.data.filter(acc => acc.status === "Active");
            setAccounts(activeAccs);
            if (activeAccs.length > 0) {
                setSelectedSenderId(activeAccs[0].id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const token = localStorage.getItem("token");
            await api.post("/transactions/transfer", {
                sender_account_id: parseInt(selectedSenderId),
                receiver_account_number: receiverAccountNumber.trim(),
                amount: parseFloat(amount)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Transfer successful!");
            setMessageType("success");
            setAmount("");
            setReceiverAccountNumber("");
            fetchAccounts(); // refresh balances
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || "Transfer failed.");
            setMessageType("danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="mb-4">
                <h1 className="page-title">Transfer Funds</h1>
                <p className="text-secondary">Send funds securely to another active bank account instantly.</p>
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

            <div className="row justify-content-center">
                <div className="col-md-6 col-12">
                    <div className="card border-0 p-4 shadow-sm">
                        <h3 className="text-primary mb-3">Transfer Form</h3>
                        {accounts.length > 0 ? (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="snd-account" className="form-label">From Account (Source)</label>
                                    <select
                                        id="snd-account"
                                        className="form-select form-select-lg"
                                        value={selectedSenderId}
                                        onChange={(e) => setSelectedSenderId(e.target.value)}
                                        required
                                    >
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.account_type} - {acc.account_number} (Balance: ₹{acc.balance?.toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="rcv-account" className="form-label">Receiver Account Number</label>
                                    <input
                                        id="rcv-account"
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="Enter 12-digit account number"
                                        value={receiverAccountNumber}
                                        onChange={(e) => setReceiverAccountNumber(e.target.value)}
                                        maxLength="12"
                                        pattern="\d{12}"
                                        title="Please enter a valid 12-digit receiver account number"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="trf-amount" className="form-label">Amount (₹)</label>
                                    <input
                                        id="trf-amount"
                                        type="number"
                                        className="form-control form-control-lg"
                                        placeholder="Enter transfer amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="1"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="spinner-border spinner-border-sm text-white" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    ) : "Confirm & Send Funds"}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-4 text-secondary">
                                <p className="mb-0">You don't have any active accounts. Please create one to transfer funds.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default Transfer;
