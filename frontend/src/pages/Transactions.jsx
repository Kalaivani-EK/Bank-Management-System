import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/table.css";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filters
    const [typeFilter, setTypeFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchTransactions = async (pageNumber = 1) => {
        try {
            const token = localStorage.getItem("token");
            let url = `/transactions/history?page=${pageNumber}&per_page=10`;
            if (typeFilter) url += `&type=${typeFilter}`;
            if (startDate) url += `&start_date=${startDate}`;
            if (endDate) url += `&end_date=${endDate}`;

            const response = await api.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data.transactions || []);
            setTotalPages(response.data.pages || 1);
            setPage(response.data.page || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error("Error fetching transactions", error);
        }
    };

    useEffect(() => {
        fetchTransactions(1);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTransactions(1);
    };

    const handleReset = () => {
        setTypeFilter("");
        setStartDate("");
        setEndDate("");
        // Execute fetch with empty filters immediately
        setTimeout(() => {
            fetchTransactions(1);
        }, 50);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchTransactions(newPage);
        }
    };

    const getBadgeClass = (type) => {
        if (type === "Deposit" || type === "Transfer In") {
            return "bg-success text-white";
        }
        return "bg-danger text-white";
    };

    const getAmountStyle = (type) => {
        if (type === "Deposit" || type === "Transfer In") {
            return { fontWeight: 700, color: "#198754" }; // Green
        }
        return { fontWeight: 700, color: "#dc3545" }; // Red
    };

    const getAmountPrefix = (type) => {
        if (type === "Deposit" || type === "Transfer In") {
            return "+";
        }
        return "-";
    };

    return (
        <MainLayout>
            <div className="mb-4">
                <h1 className="page-title">Transaction History</h1>
                <p className="text-secondary">View and filter your personal financial transaction history.</p>
            </div>

            {/* Filter Panel */}
            <div className="card border-0 p-4 shadow-sm mb-4">
                <h3 className="text-primary mb-3">Filter Transactions</h3>
                <form onSubmit={handleSearch} className="row g-3 align-items-end">
                    <div className="col-md-3 col-sm-6">
                        <label htmlFor="filter-type" className="form-label">Type</label>
                        <select
                            id="filter-type"
                            className="form-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="Deposit">Deposit</option>
                            <option value="Withdrawal">Withdrawal</option>
                            <option value="Transfer In">Transfer In</option>
                            <option value="Transfer Out">Transfer Out</option>
                        </select>
                    </div>

                    <div className="col-md-3 col-sm-6">
                        <label htmlFor="start-date" className="form-label">Start Date</label>
                        <input
                            id="start-date"
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="col-md-3 col-sm-6">
                        <label htmlFor="end-date" className="form-label">End Date</label>
                        <input
                            id="end-date"
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="col-md-3 col-sm-6 d-flex gap-2">
                        <button type="submit" className="btn btn-primary flex-grow-1">
                            Search
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary flex-grow-1"
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Table Panel */}
            <div className="card border-0 p-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-primary mb-0">Record Ledger</h3>
                    <span className="text-secondary small">Total Records: {totalItems}</span>
                </div>

                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Type</th>
                                <th>Source Account</th>
                                <th>Destination Account</th>
                                <th>Amount</th>
                                <th>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((txn) => (
                                    <tr key={txn.id}>
                                        <td>#{txn.id}</td>
                                        <td>
                                            <span className={`badge ${getBadgeClass(txn.transaction_type)} px-2 py-1.5`}>
                                                {txn.transaction_type}
                                            </span>
                                        </td>
                                        <td>
                                            {txn.from_account_id ? `Account #${txn.from_account_id}` : "N/A"}
                                        </td>
                                        <td>
                                            {txn.to_account_id ? `Account #${txn.to_account_id}` : "N/A"}
                                        </td>
                                        <td style={getAmountStyle(txn.transaction_type)}>
                                            {getAmountPrefix(txn.transaction_type)} ₹{txn.amount?.toLocaleString()}
                                        </td>
                                        <td className="text-secondary small">
                                            {txn.created_at || "N/A"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-4">
                                        No transactions match your search filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Navigation */}
                {totalPages > 1 && (
                    <nav className="d-flex justify-content-center mt-4">
                        <ul className="pagination mb-0">
                            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(page - 1)}
                                >
                                    Previous
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(p)}
                                    >
                                        {p}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(page + 1)}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </MainLayout>
    );
}

export default Transactions;