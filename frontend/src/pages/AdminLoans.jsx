import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/table.css";

function AdminLoans() {
    const [loans, setLoans] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    // Modal decision states
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [decision, setDecision] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLoans = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get(
                "/admin/loan-applications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setLoans(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        void fetchLoans();
    }, []);

    const openDecisionModal = (loan, decisionType) => {
        setSelectedLoan(loan);
        setDecision(decisionType);
        setRemarks("");
        setIsModalOpen(true);
    };

    const handleConfirmDecision = async (e) => {
        e.preventDefault();
        if (!selectedLoan) return;
        try {
            const token = localStorage.getItem("token");
            await api.put(
                `/admin/${decision}-loan/${selectedLoan.id}`,
                { remarks: remarks },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage(`Loan application ${decision === "approve" ? "Approved and amount credited" : "Rejected"} successfully!`);
            setMessageType(decision === "approve" ? "success" : "warning");
            setIsModalOpen(false);
            setSelectedLoan(null);
            setRemarks("");
            fetchLoans();

            setTimeout(() => {
                setMessage("");
            }, 6000);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || `Failed to ${decision} loan.`);
            setMessageType("danger");
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Approved": return "bg-success text-white";
            case "Rejected": return "bg-danger text-white";
            case "Pending": default: return "bg-warning text-dark";
        }
    };

    return (
        <MainLayout>
            <div className="mb-4">
                <h1 className="page-title">Loan Approvals</h1>
                <p className="text-secondary">Approve or reject credit facility requests submitted by clients.</p>
            </div>

            {message && (
                <div className={`custom-alert custom-alert-${messageType} mb-4`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>{message}</span>
                </div>
            )}

            <div className="card border-0 p-4 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered align-middle mb-0">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer ID</th>
                                <th>Loan Type</th>
                                <th>Amount</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loans.length > 0 ? (
                                loans.map((loan) => (
                                    <tr key={loan.id}>
                                        <td>{loan.id}</td>
                                        <td>
                                            <div className="fw-semibold">Customer #{loan.customer_id}</div>
                                        </td>
                                        <td>{loan.loan_type}</td>
                                        <td className="fw-bold">₹{loan.amount_requested?.toLocaleString()}</td>
                                        <td>{loan.duration_months} Months</td>
                                        <td>
                                            <span className={`badge ${getStatusClass(loan.status)} px-2 py-1.5`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td>
                                            {loan.remarks ? (
                                                <span className="text-secondary small">{loan.remarks}</span>
                                            ) : (
                                                <span className="text-muted small italic">None</span>
                                            )}
                                        </td>

                                        <td>
                                            {loan.status === "Pending" ? (
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => openDecisionModal(loan, "approve")}
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => openDecisionModal(loan, "reject")}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-secondary small">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center p-4">
                                        No loan applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-card">
                        <div className="modal-header">
                            <h3>Confirm Loan {decision === "approve" ? "Approval" : "Rejection"}</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => setIsModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleConfirmDecision}>
                            <div className="form-group mb-4">
                                <label htmlFor="decision-remarks" className="form-label">Decision Remarks / Comments</label>
                                <textarea
                                    id="decision-remarks"
                                    className="form-control"
                                    rows="3"
                                    placeholder="Enter reason or comments for this decision..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`btn ${decision === "approve" ? "btn-success" : "btn-danger"}`}
                                >
                                    Confirm {decision === "approve" ? "Approval" : "Rejection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export default AdminLoans;