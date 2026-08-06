import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import SuccessReceiptModal from "../components/SuccessReceiptModal";

function Transfer() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [selectedSenderId, setSelectedSenderId] = useState("");
    const [receiverAccountNumber, setReceiverAccountNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [transactionPin, setTransactionPin] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [pinError, setPinError] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const fetchAccounts = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/accounts/my-accounts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const activeAccs = response.data.filter(acc => acc.status === "Active");
            setAccounts(activeAccs);
            if (activeAccs.length > 0) {
                setSelectedSenderId(activeAccs[0].id);
            }
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchAccounts();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [fetchAccounts]);

    const validatePin = () => {
        if (!/^[0-9]{4}$/.test(transactionPin)) {
            setPinError("PIN must be exactly 4 digits.");
            return false;
        }
        setPinError("");
        return true;
    };

    const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        return date.toLocaleString();
    };

    const handleDownloadReceipt = async () => {
        if (!receiptData) return false;
        setDownloadLoading(true);
        try {
            const doc = new jsPDF({ unit: "pt", format: "a4" });
            const left = 40;
            let y = 60;

            doc.setFontSize(22);
            doc.setTextColor("#064e3b");
            doc.text("FINOVA", left, y);
            y += 30;
            doc.setFontSize(14);
            doc.setTextColor("#134e4a");
            doc.text("Transaction Receipt", left, y);
            y += 30;
            doc.setDrawColor("#10b981");
            doc.setLineWidth(1.5);
            doc.line(left, y, 555, y);
            y += 30;

            const addRow = (label, value) => {
                doc.setFontSize(10);
                doc.setTextColor("#475569");
                doc.text(label, left, y);
                doc.setFontSize(12);
                doc.setTextColor("#0f172a");
                doc.text(value, left + 170, y);
                y += 22;
            };

            addRow("Receipt Number:", receiptData.receiptId);
            addRow("Transaction ID:", receiptData.transactionId.toString());
            addRow("Date & Time:", formatDate(receiptData.generatedAt));
            addRow("Sender Name:", receiptData.senderName);
            addRow("Sender Account:", receiptData.senderAccount);
            addRow("Receiver Name:", receiptData.receiverName);
            addRow("Receiver Account:", receiptData.receiverAccount);
            addRow("Transfer Type:", receiptData.transferType);
            addRow("Amount:", `₹${receiptData.amount?.toLocaleString()}`);
            addRow("Charges:", `₹${Number(receiptData.transactionCharges || 0).toFixed(2)}`);
            addRow("Status:", receiptData.status || "Success");
            addRow("Remaining Balance:", `₹${receiptData.remainingBalance?.toLocaleString()}`);

            y += 16;
            doc.setLineWidth(0.8);
            doc.line(left, y, 555, y);
            y += 24;
            doc.setFontSize(11);
            doc.setTextColor("#0f172a");
            doc.text("Thank you for banking with Apex Bank.", left, y);
            y += 20;
            doc.text("This is a computer-generated receipt. No signature is required.", left, y);

            doc.save(`${receiptData.receiptId}.pdf`);
            return true;
        } catch (error) {
            console.error(error);
            setMessage("Unable to generate receipt PDF.");
            setMessageType("danger");
            return false;
        } finally {
            setDownloadLoading(false);
        }
    };

    const handlePrintReceipt = () => {
        if (!receiptData) return;
        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>FINOVA Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
                        h1 { color: #046c4c; }
                        .field { margin-bottom: 12px; }
                        .label { color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
                        .value { font-size: 14px; font-weight: 700; }
                        .section { margin-bottom: 22px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
                    </style>
                </head>
                <body>
                    <h1>FINOVA</h1>
                    <h2>Transaction Receipt</h2>
                    <div class="section">
                        <div class="field"><div class="label">Receipt Number</div><div class="value">${receiptData.receiptId}</div></div>
                        <div class="field"><div class="label">Transaction ID</div><div class="value">${receiptData.transactionId}</div></div>
                        <div class="field"><div class="label">Date & Time</div><div class="value">${formatDate(receiptData.generatedAt)}</div></div>
                    </div>
                    <div class="section">
                        <div class="field"><div class="label">Sender Name</div><div class="value">${receiptData.senderName}</div></div>
                        <div class="field"><div class="label">Sender Account</div><div class="value">${receiptData.senderAccount}</div></div>
                    </div>
                    <div class="section">
                        <div class="field"><div class="label">Receiver Name</div><div class="value">${receiptData.receiverName}</div></div>
                        <div class="field"><div class="label">Receiver Account</div><div class="value">${receiptData.receiverAccount}</div></div>
                    </div>
                    <div class="section">
                        <div class="field"><div class="label">Transfer Type</div><div class="value">${receiptData.transferType}</div></div>
                        <div class="field"><div class="label">Amount</div><div class="value">₹${receiptData.amount?.toLocaleString()}</div></div>
                        <div class="field"><div class="label">Charges</div><div class="value">₹${receiptData.transactionCharges?.toFixed(2)}</div></div>
                        <div class="field"><div class="label">Status</div><div class="value">${receiptData.status}</div></div>
                        <div class="field"><div class="label">Remaining Balance</div><div class="value">₹${receiptData.remainingBalance?.toLocaleString()}</div></div>
                    </div>
                    <p>Thank you for banking with Finova.</p>
                    <p>This is a computer-generated receipt. No signature is required.</p>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleShareReceipt = async () => {
        const payload = `FINOVA Receipt\nReceipt Number: ${receiptData?.receiptId}\nTransaction ID: ${receiptData?.transactionId}\nAmount: ₹${receiptData?.amount?.toLocaleString()}\nStatus: ${receiptData?.status}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "FINOVA Transfer Receipt",
                    text: payload
                });
            } catch (error) {
                console.error(error);
                setMessage("Unable to share receipt right now.");
                setMessageType("danger");
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(payload);
            setMessage("Receipt details copied to clipboard.");
            setMessageType("success");
        } catch (error) {
            console.error(error);
            setMessage("Unable to copy receipt details.");
            setMessageType("danger");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const token = localStorage.getItem("token");
            if (!validatePin()) {
                setLoading(false);
                return;
            }

            const response = await api.post("/transactions/transfer", {
                sender_account_id: parseInt(selectedSenderId),
                receiver_account_number: receiverAccountNumber.trim(),
                amount: parseFloat(amount),
                transaction_pin: transactionPin
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.receipt) {
                setReceiptData(response.data.receipt);
                setShowReceiptModal(true);
            }

            setAmount("");
            setReceiverAccountNumber("");
            fetchAccounts();
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

                                <div className="form-group mb-4 password-toggle-group">
                                    <label htmlFor="trf-pin">Transaction PIN</label>
                                    <input
                                        id="trf-pin"
                                        type={showPin ? "text" : "password"}
                                        className="form-control form-control-lg"
                                        placeholder="Enter 4-digit PIN"
                                        value={transactionPin}
                                        onChange={(e) => setTransactionPin(e.target.value.replace(/[^0-9]/g, ""))}
                                        maxLength="4"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-icon"
                                        onClick={() => setShowPin(!showPin)}
                                    >
                                        {showPin ? "🙈" : "👁"}
                                    </button>
                                </div>

                                {pinError && <div className="inline-error mb-3">{pinError}</div>}

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
            {showReceiptModal && receiptData && (
                <SuccessReceiptModal
                    transaction={receiptData}
                    onClose={() => {
                        setShowReceiptModal(false);
                        setReceiptData(null);
                    }}
                    onBackToDashboard={() => {
                        setShowReceiptModal(false);
                        setReceiptData(null);
                        navigate("/dashboard");
                    }}
                    onDownload={async () => {
                        const success = await handleDownloadReceipt();
                        if (success) {
                            setShowReceiptModal(false);
                            setReceiptData(null);
                        }
                        return success;
                    }}
                    onPrint={handlePrintReceipt}
                    onShare={handleShareReceipt}
                    loading={downloadLoading}
                />
            )}        </MainLayout>
    );
}

export default Transfer;
