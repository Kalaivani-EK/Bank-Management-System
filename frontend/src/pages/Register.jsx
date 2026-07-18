import { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "../styles/login.css";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                "/auth/register",
                {
                    name,
                    email,
                    password,
                    phone,
                    address
                }
            );

            alert(response.data.message);

            setName("");
            setEmail("");
            setPassword("");
            setPhone("");
            setAddress("");

        } catch (error) {

            console.log(error);

            alert("Registration Failed");
        }
    };

    return (
        <div className="login-container container-fluid d-flex align-items-center justify-content-center">
            <div className="login-wrapper row g-0 shadow-lg">
                {/* Brand Showcase Panel */}
                <div className="login-brand-panel col-md-6 d-flex flex-column justify-content-between p-5">
                    <div className="brand-logo d-flex align-items-center gap-2">
                        <div className="brand-icon">A</div>
                        <span className="brand-title">APEX BANK</span>
                    </div>

                    <div className="brand-promo mt-auto">
                        <h2 className="display-6 fw-bold">Join APEX Banking</h2>
                        <p className="lead">Unlock premium, secure financial services by opening an account in under 3 minutes.</p>
                        
                        <div className="brand-features d-flex flex-column gap-3 mt-4">
                            <div className="brand-feature-item d-flex align-items-center gap-2">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                Automated account numbering & fast approvals
                            </div>
                            <div className="brand-feature-item d-flex align-items-center gap-2">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                24/7 dedicated support ticket system
                            </div>
                            <div className="brand-feature-item d-flex align-items-center gap-2">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                High-yield savings & business credit facilities
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Processing Panel */}
                <div className="login-form-panel col-md-6 p-5 d-flex flex-column justify-content-center bg-white">
                    <h1 className="h3 fw-bold mb-1">Create Account</h1>
                    <p className="text-secondary mb-4">Enter your details to register as a client</p>

                    <form onSubmit={handleRegister}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                className="form-control"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="phone" className="form-label">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                className="form-control"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="address" className="form-label">Residential Address</label>
                            <input
                                id="address"
                                type="text"
                                className="form-control"
                                placeholder="123 Main St, New Delhi"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-3"
                        >
                            Submit Registration
                        </button>

                        <div className="register-link mt-4 text-center">
                            <p className="mb-0">
                                Already have an account?{" "}
                                <Link to="/login" className="text-primary fw-semibold">
                                    Sign In here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;