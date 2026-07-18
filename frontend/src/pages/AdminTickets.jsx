import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/table.css";

function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get(
                "/admin/tickets",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTickets(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        void fetchTickets();
    }, []);

    const resolveTicket = async (ticketId) => {
        try {
            const token = localStorage.getItem("token");

            await api.put(
                `/admin/resolve-ticket/${ticketId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("Ticket resolved successfully!");
            setMessageType("success");
            fetchTickets();

            setTimeout(() => {
                setMessage("");
            }, 6000);
        } catch (error) {
            console.error(error);
            setMessage("Failed to resolve ticket.");
            setMessageType("danger");
        }
    };

    return (
        <MainLayout>
            <div className="mb-4">
                <h1 className="page-title">Manage Tickets</h1>
                <p className="text-secondary">Process and resolve customer support queries.</p>
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
                                <th>Customer ID</th>
                                <th>Subject</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tickets.length > 0 ? (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>{ticket.id}</td>
                                        <td>
                                            <div className="fw-semibold">Customer #{ticket.customer_id}</div>
                                        </td>
                                        <td className="fw-semibold">{ticket.subject}</td>
                                        <td>{ticket.description}</td>
                                        <td>
                                            <span className={`badge ${ticket.status === 'Resolved' ? 'bg-success text-white' : 'bg-warning text-dark'} px-2 py-1.5`}>
                                                {ticket.status}
                                            </span>
                                        </td>

                                        <td>
                                            {ticket.status === "Open" ? (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() =>
                                                        resolveTicket(ticket.id)
                                                    }
                                                >
                                                    Resolve
                                                </button>
                                            ) : (
                                                <span className="text-secondary small">Resolved</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-4">
                                        No support tickets found.
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

export default AdminTickets;