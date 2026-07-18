import { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/table.css";

function Support() {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [tickets, setTickets] = useState([]);
    
    // Alerts
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/support/my-tickets", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTickets(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const createTicket = async (e) => {
        e.preventDefault();
        if (!subject || !description) {
            setMessage("Please enter a subject and description.");
            setMessageType("danger");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await api.post(
                "/support/create-ticket",
                {
                    subject,
                    description
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage("Ticket created successfully! Staff will review it shortly.");
            setMessageType("success");
            setSubject("");
            setDescription("");
            fetchTickets();

            setTimeout(() => {
                setMessage("");
            }, 6000);
        } catch (error) {
            console.log(error);
            setMessage("Failed to submit support ticket. Please try again.");
            setMessageType("danger");
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Resolved": return "bg-success text-white";
            case "Open": default: return "bg-warning text-dark";
        }
    };

    return (
        <MainLayout>
            <div className="mb-4">
                <h1 className="page-title">Support Tickets</h1>
                <p className="text-secondary">Open queries, report bugs, and view response states from our administrators.</p>
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
                {/* Left Panel: Ticket Creation Form */}
                <div className="col-lg-5">
                    <div className="card border-0 p-4 shadow-sm h-100">
                        <h3 className="text-primary mb-3">Create New Ticket</h3>
                        
                        <form onSubmit={createTicket}>
                            <div className="mb-3">
                                <label htmlFor="ticket-subject" className="form-label">Ticket Subject</label>
                                <input
                                    id="ticket-subject"
                                    type="text"
                                    className="form-control"
                                    placeholder="Brief title of the query"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="ticket-desc" className="form-label">Detailed Description</label>
                                <textarea
                                    id="ticket-desc"
                                    className="form-control"
                                    placeholder="Explain your issue in detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="5"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-3"
                            >
                                Open Ticket
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Panel: Tickets History */}
                <div className="col-lg-7">
                    <div className="card border-0 p-4 shadow-sm h-100">
                        <h3 className="text-primary mb-3">My Support Queries</h3>
                        
                        <div className="d-flex flex-column gap-3">
                            {tickets.length > 0 ? (
                                tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="card border-0 shadow-sm"
                                        style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                                    >
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h4 className="h6 fw-bold mb-0">
                                                    {ticket.subject}
                                                </h4>
                                                <span className={`badge ${getStatusClass(ticket.status)} px-3 py-2`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="small text-secondary mb-0">
                                                {ticket.description}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-5 text-center border border-dashed rounded-3">
                                    <p className="text-secondary mb-0">You don't have any support tickets open.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default Support;