import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/table.css";

function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get(
                "/admin/customers",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setCustomers(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleApproveKyc = async (customerId) => {
        try {
            const token = localStorage.getItem("token");
            await api.put(
                `/admin/approve-kyc/${customerId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setMessage("KYC Approved successfully!");
            setMessageType("success");
            fetchCustomers();

            setTimeout(() => {
                setMessage("");
            }, 6000);
        } catch (error) {
            console.error(error);
            setMessage("Failed to approve KYC.");
            setMessageType("danger");
        }
    };

    return (
        <MainLayout>
            <div className="mb-4">
                <h1 className="page-title">Manage Customers</h1>
                <p className="text-secondary">Review user directories, verify compliance levels, and approve pending KYC files.</p>
            </div>

            {message && (
                <div className={`custom-alert custom-alert-${messageType} mb-4`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>{message}</span>
                </div>
            )}

            <div className="card border-0 p-4 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>KYC Status</th>
                                <th>Account Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.length > 0 ? (
                                customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>{customer.id}</td>
                                        <td>
                                            <div className="fw-semibold">{customer.name}</div>
                                        </td>
                                        <td>{customer.email}</td>
                                        <td>
                                            <span className={`badge ${customer.kyc_status === 'Approved' ? 'bg-success text-white' : 'bg-warning text-dark'} px-2 py-1.5`}>
                                                {customer.kyc_status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${customer.is_active ? 'bg-success text-white' : 'bg-danger text-white'} px-2 py-1.5`}>
                                                {customer.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            {customer.kyc_status === "Pending" ? (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleApproveKyc(customer.id)}
                                                >
                                                    Approve KYC
                                                </button>
                                            ) : (
                                                <span className="text-secondary small">Verified</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-4">
                                        No registered customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
}

export default AdminCustomers;