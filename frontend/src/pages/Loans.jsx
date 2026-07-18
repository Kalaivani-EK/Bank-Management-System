import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/table.css";

function Loans() {
    const [loans, setLoans] = useState([]);
    
    // Form States
    const [loanType, setLoanType] = useState("Personal Loan");
    const [amountRequested, setAmountRequested] = useState("");
    const [durationMonths, setDurationMonths] = useState("");
    
    // Alerts
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchLoans = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/loans/my-loans", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLoans(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleApplyLoan = async (e) => {
        e.preventDefault();
        if (!amountRequested || !durationMonths || parseFloat(amountRequested) <= 0 || parseInt(durationMonths) <= 0) {
            setMessage("Please enter valid positive loan terms.");
            setMessageType("danger");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await api.post(
                "/loans/apply",
                {
                    loan_type: loanType,
                    amount_requested: parseFloat(amountRequested),
                    duration_months: parseInt(durationMonths)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("Loan application submitted successfully! Pending admin approval.");
            setMessageType("success");
            setAmountRequested("");
            setDurationMonths("");
            fetchLoans();

            setTimeout(() => {
                setMessage("");
            }, 6000);
        } catch (error) {
            console.error(error);
            setMessage("Failed to submit loan request. Please check details.");
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
                <h1 className="page-title">My Loans</h1>
                <p className="text-secondary">Request capital, configure durations, and track approval states.</p>
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
                {/* Left Panel: Apply Form */}
                <div className="col-lg-5">
                    <div className="card border-0 p-4 shadow-sm h-100">
                        <h3 className="text-primary mb-3">Apply for a Loan</h3>
                        <form onSubmit={handleApplyLoan}>
                            <div className="mb-3">
                                <label htmlFor="loan-type" className="form-label">Loan Facility Type</label>
                                <select
                                    id="loan-type"
                                    className="form-select"
                                    value={loanType}
                                    onChange={(e) => setLoanType(e.target.value)}
                                >
                                    <option value="Personal Loan">Personal Loan</option>
                                    <option value="Home Loan">Home Loan</option>
                                    <option value="Car Loan">Car/Auto Loan</option>
                                    <option value="Education Loan">Education Loan</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="loan-amount" className="form-label">Amount Requested (₹)</label>
                                <input
                                    id="loan-amount"
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 50000"
                                    value={amountRequested}
                                    onChange={(e) => setAmountRequested(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="loan-duration" className="form-label">Duration (Months)</label>
                                <input
                                    id="loan-duration"
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 12"
                                    value={durationMonths}
                                    onChange={(e) => setDurationMonths(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-3"
                            >
                                Submit Loan Application
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Panel: Applications list */}
                <div className="col-lg-7">
                    <div className="card border-0 p-4 shadow-sm h-100">
                        <h3 className="text-primary mb-3">Submitted Facilities</h3>
                        <div className="d-flex flex-column gap-3">
                            {loans.length > 0 ? (
                                loans.map((loan) => (
                                    <div
                                        key={loan.id}
                                        className="card border-0 shadow-sm"
                                        style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                                    >
                                        <div className="card-body d-flex justify-content-between align-items-center p-3">
                                            <div>
                                                <div className="small text-primary fw-bold text-uppercase">
                                                    {loan.loan_type}
                                                </div>
                                                <h4 className="h5 fw-bold mb-1 mt-1">₹{loan.amount_requested?.toLocaleString()}</h4>
                                                <p className="small text-secondary mb-1">
                                                    Duration: {loan.duration_months} Months
                                                </p>
                                                {loan.remarks && (
                                                    <div className="small bg-light p-2 rounded mt-2 border-start border-primary border-3">
                                                        <span className="fw-semibold">Admin Remarks: </span>
                                                        <span className="text-secondary">{loan.remarks}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <span className={`badge ${getStatusClass(loan.status)} px-3 py-2 fs-7`}>
                                                    {loan.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-5 text-center border border-dashed rounded-3">
                                    <p className="text-secondary mb-0">No active loan applications found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default Loans;