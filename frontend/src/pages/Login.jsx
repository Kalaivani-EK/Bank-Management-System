import { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "role",
                response.data.role
            );

            if (response.data.role === "admin") {
                navigate("/admin-dashboard");
            }else {
                 navigate("/dashboard");
            }

            console.log(response.data);

        } catch (error) {
            console.error(error);
            alert("Login Failed");
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
                        <h2 className="display-6 fw-bold">Your Financial Future, Secured.</h2>
                        <p className="lead">Experience a smart, seamless, and completely secure digital banking portal designed for modern clients.</p>
                        
                        <div className="brand-features d-flex flex-column gap-3 mt-4">
                            <div className="brand-feature-item d-flex align-items-center gap-2">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                Instant account opening & real-time monitoring
                            </div>
                            <div className="brand-feature-item d-flex align-items-center gap-2">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                Frictionless deposits, withdrawals, & transfers
                            </div>
                            <div className="brand-feature-item d-flex align-items-center gap-2">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                Transparent loan applications & support system
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Processing Panel */}
                <div className="login-form-panel col-md-6 p-5 d-flex flex-column justify-content-center bg-white">
                    <h1 className="h3 fw-bold mb-1">Sign In</h1>
                    <p className="text-secondary mb-4">Enter your credentials to access your dashboard</p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="form-control form-control-lg"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control form-control-lg"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-3"
                        >
                            Sign In to Portal
                        </button>

                        <div className="register-link mt-4 text-center">
                            <p className="mb-0">
                                Don't have an account?{" "}
                                <Link to="/register" className="text-primary fw-semibold">
                                    Register Now
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;