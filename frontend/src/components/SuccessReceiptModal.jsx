import { useEffect } from "react";

function SuccessReceiptModal({ transaction, onClose, onBackToDashboard, onDownload, onPrint, onShare, loading }) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const maskAccount = (account) => {
    if (!account) return "";
    const clean = account.toString();
    return clean.slice(0, -4).replace(/./g, "*") + clean.slice(-4);
  };

  const handleDownloadAndClose = async () => {
    const result = await onDownload();
    if (result) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-card success-modal-card">
        <div className="modal-header">
          <div>
            <div className="success-badge">Transfer Successful</div>
            <p className="text-secondary mt-2">Your funds have been transferred successfully.</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="success-icon-wrapper">
          <div className="success-icon">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4">
              <circle cx="32" cy="32" r="28" />
              <path d="M20 34l8 8 16-20" />
            </svg>
          </div>
        </div>

        <div className="receipt-card glass-card mb-4">
          <div className="receipt-header d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="receipt-title mb-1">Transfer Receipt</h2>
              <p className="receipt-subtitle">Receipt details for your completed transaction.</p>
            </div>
            <div className="badge badge-success">Success</div>
          </div>

          <div className="receipt-grid">
            <div className="receipt-item">
              <div className="label">Receipt Number</div>
              <div>{transaction.receiptId}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Transaction ID</div>
              <div>{transaction.transactionId}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Date & Time</div>
              <div>{transaction.generatedAt}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Sender Name</div>
              <div>{transaction.senderName}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Sender Account</div>
              <div>{maskAccount(transaction.senderAccount)}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Receiver Name</div>
              <div>{transaction.receiverName}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Receiver Account</div>
              <div>{maskAccount(transaction.receiverAccount)}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Transfer Type</div>
              <div>{transaction.transferType}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Amount Transferred</div>
              <div>₹{transaction.amount?.toLocaleString()}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Transaction Charges</div>
              <div>₹{Number(transaction.transactionCharges || 0).toFixed(2)}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Status</div>
              <div>{transaction.status || "Success"}</div>
            </div>
            <div className="receipt-item">
              <div className="label">Remaining Balance</div>
              <div>₹{transaction.remainingBalance?.toLocaleString()}</div>
            </div>
          </div>

          <div className="receipt-actions mt-4">
            <button className="btn btn-primary w-100 mb-3" onClick={handleDownloadAndClose} disabled={loading}>
              {loading ? "Generating PDF…" : "📄 Download Receipt"}
            </button>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <button className="btn btn-outline-secondary flex-fill" onClick={onPrint}>
                🖨 Print Receipt
              </button>
              <button className="btn btn-outline-secondary flex-fill" onClick={onShare}>
                📤 Share Receipt
              </button>
              <button className="btn btn-secondary flex-fill" onClick={onBackToDashboard}>
                🏠 Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessReceiptModal;
