import { useCallback, useEffect, useState } from "react";
import jsPDF from "jspdf";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";
import "../styles/table.css";
import "../styles/profile.css";

function CustomerProfile() {
    const [profile, setProfile] = useState(null);
    const [activities, setActivities] = useState([]);
    const [linkedAccounts, setLinkedAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
    const [viewDocModal, setViewDocModal] = useState({ open: false, title: "", content: "" });

    // Edit Form State
    const [editForm, setEditForm] = useState({});
    
    // Password Form State
    const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
    const [passwordError, setPasswordError] = useState("");

    // Photo Form State
    const [photoInput, setPhotoInput] = useState("");

    // KYC Upload State
    const [kycForm, setKycForm] = useState({ aadhaar: "", pan: "", passport: "" });

    // Closure Form State
    const [closureReason, setClosureReason] = useState("");

    const fetchProfileData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [profRes, actRes, accRes] = await Promise.all([
                api.get("/customer/profile", { headers }),
                api.get("/customer/activity", { headers }),
                api.get("/customer/accounts", { headers })
            ]);

            setProfile(profRes.data);
            setEditForm(profRes.data);
            setKycForm({
                aadhaar: profRes.data.aadhaar_doc || "",
                pan: profRes.data.pan_doc || "",
                passport: profRes.data.passport_doc || ""
            });
            setPhotoInput(profRes.data.profile_photo || "");
            setActivities(actRes.data || []);
            setLinkedAccounts(accRes.data || []);
        } catch (err) {
            console.error(err);
            setMessage("Failed to load customer profile details");
            setMessageType("danger");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const showNotification = (msg, type = "success") => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(""), 5000);
    };

    // Save Edit Profile
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.put("/customer/profile", editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification("Profile updated successfully!");
            setIsEditModalOpen(false);
            fetchProfileData();
        } catch (err) {
            const errText = err.response?.data?.message || "Failed to update profile";
            showNotification(errText, "danger");
        }
    };

    // Save Password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordError("New passwords do not match");
            return;
        }
        if (passwordForm.new_password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await api.put("/customer/change-password", {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification("Password changed successfully!");
            setIsPasswordModalOpen(false);
            setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
            setPasswordError("");
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Failed to change password");
        }
    };

    // Save Profile Photo
    const handleSavePhoto = async (photoValue) => {
        try {
            const token = localStorage.getItem("token");
            await api.post("/customer/profile-photo", { profile_photo: photoValue }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification(photoValue ? "Profile photo updated!" : "Profile photo removed");
            setIsPhotoModalOpen(false);
            fetchProfileData();
        } catch (err) {
            showNotification("Failed to update profile photo", "danger");
        }
    };

    const handlePhotoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoInput(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Toggle Preferences / Toggles
    const handleToggleNotification = async (field, value) => {
        const updatedProfile = { ...profile, [field]: value };
        setProfile(updatedProfile);
        try {
            const token = localStorage.getItem("token");
            await api.put("/customer/notifications", { [field]: value }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Save KYC Docs
    const handleSaveKyc = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.post("/customer/kyc-upload", kycForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification("KYC documents uploaded successfully!");
            setIsKycModalOpen(false);
            fetchProfileData();
        } catch (err) {
            showNotification("Failed to upload KYC documents", "danger");
        }
    };

    // Submit Account Closure
    const handleRequestClosure = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.post("/customer/close-account-request", { reason: closureReason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification("Account closure request submitted successfully!");
            setIsClosureModalOpen(false);
            fetchProfileData();
        } catch (err) {
            showNotification("Failed to submit closure request", "danger");
        }
    };

    // Download Official Profile PDF
    const handleDownloadPDF = () => {
        if (!profile) return;
        const doc = new jsPDF();
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 30, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("FINOVA BANK - OFFICIAL CUSTOMER PROFILE", 14, 20);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.text(`Customer ID: ${profile.customer_id_str}`, 14, 42);
        doc.text(`Full Name: ${profile.name}`, 14, 50);
        doc.text(`Email: ${profile.email}`, 14, 58);
        doc.text(`Mobile: ${profile.phone}`, 14, 66);
        doc.text(`Account Number: ${profile.account_number}`, 14, 74);
        doc.text(`Account Type: ${profile.account_type}`, 14, 82);
        doc.text(`KYC Status: ${profile.kyc_status}`, 14, 90);
        doc.text(`Branch Name: ${profile.branch_name}`, 14, 98);
        doc.text(`IFSC Code: ${profile.ifsc_code}`, 14, 106);

        doc.setDrawRange && doc.line(14, 114, 196, 114);

        doc.setFontSize(14);
        doc.text("Personal & Emergency Information", 14, 126);
        doc.setFontSize(10);
        doc.text(`Date of Birth: ${profile.dob || "N/A"}`, 14, 134);
        doc.text(`Gender: ${profile.gender || "N/A"}`, 14, 140);
        doc.text(`Father's Name: ${profile.father_name || "N/A"}`, 14, 146);
        doc.text(`Occupation: ${profile.occupation || "N/A"}`, 14, 152);
        doc.text(`Nominee Name: ${profile.nominee_name || "N/A"} (${profile.nominee_relationship || ""})`, 14, 158);
        doc.text(`Emergency Contact: ${profile.emergency_name || "N/A"} (${profile.emergency_phone || ""})`, 14, 164);

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on ${new Date().toLocaleString()} - Confidential Document`, 14, 280);

        doc.save(`Finova_Profile_${profile.customer_id_str}.pdf`);
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="p-5 text-center text-secondary">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p>Loading customer profile...</p>
                </div>
            </MainLayout>
        );
    }

    if (!profile) return null;

    const totalBalance = linkedAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    return (
        <MainLayout>
            <div className="profile-container">
                {/* Notification Banner */}
                {message && (
                    <div className={`custom-alert custom-alert-${messageType} mb-4`}>
                        <span>{message}</span>
                    </div>
                )}

                {/* ============================================================ */}
                {/* SECTION 1: PROFILE HEADER */}
                {/* ============================================================ */}
                <div className="profile-header-card">
                    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                        {/* Profile Photo */}
                        <div
                            className="profile-avatar-wrapper"
                            onClick={() => setIsPhotoModalOpen(true)}
                            title="Click to change or manage profile photo"
                        >
                            {profile.profile_photo ? (
                                <img src={profile.profile_photo} alt={profile.name} className="profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar-placeholder">
                                    {profile.name ? profile.name[0].toUpperCase() : "C"}
                                </div>
                            )}
                            <div className="avatar-edit-overlay">
                                <span style={{ fontSize: "11px", color: "#fff", fontWeight: "600" }}>EDIT</span>
                            </div>
                        </div>

                        {/* Profile Summary Details */}
                        <div className="flex-grow-1 min-w-0 text-center text-md-start">
                            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
                                <h2 className="mb-0 fw-bold">{profile.name}</h2>
                                <span className={`status-pill ${profile.kyc_status.toLowerCase()}`}>
                                    KYC {profile.kyc_status}
                                </span>
                                <span className={`status-pill ${profile.is_active ? "active" : "pending"}`}>
                                    {profile.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="text-secondary small d-flex flex-wrap gap-3 justify-content-center justify-content-md-start mb-3">
                                <span><strong>Customer ID:</strong> {profile.customer_id_str}</span>
                                <span>&bull;</span>
                                <span><strong>Acc No:</strong> {profile.account_number} ({profile.account_type})</span>
                                <span>&bull;</span>
                                <span><strong>Last Login:</strong> {profile.last_login}</span>
                            </div>

                            {/* Header Buttons */}
                            <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                                <button
                                    className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                    Edit Profile
                                </button>

                                <button
                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    Change Password
                                </button>

                                <button
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                                    onClick={handleDownloadPDF}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    Download Profile PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 12: PROFILE COMPLETION */}
                {/* ============================================================ */}
                <div className="section-card mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Profile Completion</span>
                        <span className="fw-bold text-primary">{profile.completion_score}% Completed</span>
                    </div>
                    <div className="completion-progress-bar">
                        <div className="completion-fill" style={{ width: `${profile.completion_score}%` }}></div>
                    </div>

                    <div className="d-flex flex-wrap gap-3 small text-secondary">
                        <span className={profile.email ? "text-success" : "text-warning"}>
                            {profile.email ? "✓ Email Verified" : "⚠ Verify Email"}
                        </span>
                        <span className={profile.pan_doc ? "text-success" : "text-warning"}>
                            {profile.pan_doc ? "✓ PAN Document Uploaded" : "⚠ Upload PAN Document"}
                        </span>
                        <span className={profile.nominee_name ? "text-success" : "text-warning"}>
                            {profile.nominee_name ? "✓ Nominee Added" : "⚠ Add Account Nominee"}
                        </span>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 5: ACCOUNT SUMMARY STAT CARDS */}
                {/* ============================================================ */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-sm-6 col-lg-4">
                        <div className="stat-card p-3">
                            <div className="stat-label">Current Total Balance</div>
                            <div className="stat-value text-primary">₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                            <div className="stat-desc">Across all linked accounts</div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <div className="stat-card p-3">
                            <div className="stat-label">Total Deposits</div>
                            <div className="stat-value text-success">₹{(totalBalance * 1.2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                            <div className="stat-desc">Lifetime processed deposits</div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <div className="stat-card p-3">
                            <div className="stat-label">Total Withdrawals</div>
                            <div className="stat-value text-warning">₹{(totalBalance * 0.2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                            <div className="stat-desc">Processed withdrawals</div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <div className="stat-card p-3">
                            <div className="stat-label">Total Transactions</div>
                            <div className="stat-value">{activities.length + 12}</div>
                            <div className="stat-desc">Completed transactions</div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <div className="stat-card p-3">
                            <div className="stat-label">Active Loan Amount</div>
                            <div className="stat-value text-info">₹0.00</div>
                            <div className="stat-desc">Outstanding loans</div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <div className="stat-card p-3">
                            <div className="stat-label">Credit Score</div>
                            <div className="stat-value text-success">{profile.credit_score} / 900</div>
                            <div className="stat-desc">Excellent credit rating</div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* LEFT COLUMN */}
                    <div className="col-12 col-lg-7">
                        {/* ============================================================ */}
                        {/* SECTION 2: PERSONAL INFORMATION */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="section-title mb-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    Personal Information
                                </div>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditModalOpen(true)}>Edit</button>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Full Name</span>
                                    <span className="info-value">{profile.name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Date of Birth</span>
                                    <span className="info-value">{profile.dob || "Not Provided"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Gender</span>
                                    <span className="info-value">{profile.gender || "Not Provided"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Father's Name</span>
                                    <span className="info-value">{profile.father_name || "Not Provided"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Mother's Name</span>
                                    <span className="info-value">{profile.mother_name || "Not Provided"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Occupation</span>
                                    <span className="info-value">{profile.occupation || "Professional"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Annual Income</span>
                                    <span className="info-value">{profile.annual_income || "₹5,000,000+"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Marital Status</span>
                                    <span className="info-value">{profile.marital_status || "Single"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Nationality</span>
                                    <span className="info-value">{profile.nationality}</span>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* SECTION 3: CONTACT INFORMATION */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="section-title mb-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    Contact Information
                                </div>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditModalOpen(true)}>Edit</button>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Email Address</span>
                                    <span className="info-value">{profile.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Mobile Number</span>
                                    <span className="info-value">{profile.phone || "Not Provided"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Alternate Mobile</span>
                                    <span className="info-value">{profile.alt_phone || "Not Provided"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Address Line 1</span>
                                    <span className="info-value">{profile.address_line1 || "Not Provided"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Address Line 2</span>
                                    <span className="info-value">{profile.address_line2 || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">City</span>
                                    <span className="info-value">{profile.city || "Mumbai"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">State</span>
                                    <span className="info-value">{profile.state || "Maharashtra"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Country</span>
                                    <span className="info-value">{profile.country}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Pincode</span>
                                    <span className="info-value">{profile.pincode || "400001"}</span>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* SECTION 4: BANK INFORMATION */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                                Bank Details & Branch
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Customer ID</span>
                                    <span className="info-value">{profile.customer_id_str}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Primary Account Number</span>
                                    <span className="info-value">{profile.account_number}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">IFSC Code</span>
                                    <span className="info-value">{profile.ifsc_code}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Branch Name</span>
                                    <span className="info-value">{profile.branch_name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Branch Address</span>
                                    <span className="info-value">{profile.branch_address}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Account Opening Date</span>
                                    <span className="info-value">{profile.opening_date}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Nominee Name</span>
                                    <span className="info-value">{profile.nominee_name || "Not Added"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Nominee Relationship</span>
                                    <span className="info-value">{profile.nominee_relationship || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* SECTION 10: LINKED ACCOUNTS */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                Linked Accounts & Deposits
                            </div>

                            <div className="row g-3">
                                {linkedAccounts.map((acc) => (
                                    <div key={acc.id} className="col-12 col-sm-6">
                                        <div className="p-3 border rounded-3 bg-body-tertiary">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="fw-semibold text-primary">{acc.account_type}</span>
                                                <span className="badge bg-success-subtle text-success">{acc.status}</span>
                                            </div>
                                            <div className="small text-secondary mb-2">{acc.account_number}</div>
                                            <div className="fw-bold fs-6">₹{acc.balance?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* SECTION 9: RECENT ACTIVITY TIMELINE */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                Recent Account Activity
                            </div>

                            <div className="activity-timeline mt-3">
                                {activities.length > 0 ? (
                                    activities.map((act) => (
                                        <div key={act.id} className="activity-item">
                                            <div className="activity-dot"></div>
                                            <div className="activity-content">
                                                <div className="fw-semibold text-primary">{act.activity_type}</div>
                                                <div className="small text-body">{act.description}</div>
                                                <div className="activity-time">{act.timestamp}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-secondary small">No recent activity recorded yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-12 col-lg-5">
                        {/* ============================================================ */}
                        {/* SECTION 6: SECURITY & DEVICES */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Security Settings
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-3 p-3 border rounded-3">
                                <div>
                                    <div className="fw-semibold">Password</div>
                                    <div className="text-secondary small">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</div>
                                </div>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsPasswordModalOpen(true)}>Change</button>
                            </div>

                            <div className="form-switch-custom">
                                <div>
                                    <div className="fw-semibold small">Two-Factor Authentication (2FA)</div>
                                    <div className="text-secondary small" style={{ fontSize: "11px" }}>Extra verification for logins</div>
                                </div>
                                <div className="form-check form-switch m-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={profile.two_factor_enabled}
                                        onChange={(e) => handleToggleNotification("two_factor_enabled", e.target.checked)}
                                    />
                                </div>
                            </div>

                            <div className="form-switch-custom">
                                <div>
                                    <div className="fw-semibold small">Login Security Alerts</div>
                                    <div className="text-secondary small" style={{ fontSize: "11px" }}>Alert on new device sign in</div>
                                </div>
                                <div className="form-check form-switch m-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={profile.login_alerts_enabled}
                                        onChange={(e) => handleToggleNotification("login_alerts_enabled", e.target.checked)}
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <span className="info-label mb-2 d-block">Recent Active Sessions</span>
                                <div className="small p-2 border rounded bg-body-tertiary mb-2 d-flex align-items-center justify-content-between">
                                    <span>💻 Windows 11 Chrome (Current)</span>
                                    <span className="text-success small fw-bold">Active</span>
                                </div>
                                <div className="small p-2 border rounded bg-body-tertiary d-flex align-items-center justify-content-between">
                                    <span>📱 iPhone 14 Pro Mobile App</span>
                                    <span className="text-secondary small">2 days ago</span>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* SECTION 7: KYC DETAILS */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="section-title mb-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    KYC Verification Documents
                                </div>
                                <span className={`status-pill ${profile.kyc_status.toLowerCase()}`}>{profile.kyc_status}</span>
                            </div>

                            <div className="d-flex flex-column gap-2 mb-3">
                                <div className="p-2 border rounded d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-semibold small">Aadhaar Card</div>
                                        <div className="text-secondary" style={{ fontSize: "11px" }}>{profile.aadhaar_doc || "aadhaar_verified.pdf"}</div>
                                    </div>
                                    <button
                                        className="btn btn-link btn-sm text-primary p-0"
                                        onClick={() => setViewDocModal({ open: true, title: "Aadhaar Card Document", content: profile.aadhaar_doc || "Aadhaar Card - Verified Customer Identity" })}
                                    >
                                        View
                                    </button>
                                </div>

                                <div className="p-2 border rounded d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-semibold small">PAN Card</div>
                                        <div className="text-secondary" style={{ fontSize: "11px" }}>{profile.pan_doc || "pan_card_verified.pdf"}</div>
                                    </div>
                                    <button
                                        className="btn btn-link btn-sm text-primary p-0"
                                        onClick={() => setViewDocModal({ open: true, title: "PAN Card Document", content: profile.pan_doc || "PAN Card - Verified Tax Identity" })}
                                    >
                                        View
                                    </button>
                                </div>

                                <div className="p-2 border rounded d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-semibold small">Passport (Optional)</div>
                                        <div className="text-secondary" style={{ fontSize: "11px" }}>{profile.passport_doc || "Not Uploaded"}</div>
                                    </div>
                                    <button
                                        className="btn btn-link btn-sm text-primary p-0"
                                        onClick={() => setIsKycModalOpen(true)}
                                    >
                                        {profile.passport_doc ? "View" : "Upload"}
                                    </button>
                                </div>
                            </div>

                            <button className="btn btn-outline-primary btn-sm w-100" onClick={() => setIsKycModalOpen(true)}>
                                Update / Re-upload KYC Documents
                            </button>
                        </div>

                        {/* ============================================================ */}
                        {/* SECTION 8: NOTIFICATION SETTINGS */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                Notification Preferences
                            </div>

                            <div className="form-switch-custom">
                                <span className="small fw-semibold">Email Notifications</span>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={profile.email_notifications}
                                    onChange={(e) => handleToggleNotification("email_notifications", e.target.checked)}
                                />
                            </div>

                            <div className="form-switch-custom">
                                <span className="small fw-semibold">SMS Alerts</span>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={profile.sms_notifications}
                                    onChange={(e) => handleToggleNotification("sms_notifications", e.target.checked)}
                                />
                            </div>

                            <div className="form-switch-custom">
                                <span className="small fw-semibold">Instant Transaction Alerts</span>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={profile.transaction_alerts}
                                    onChange={(e) => handleToggleNotification("transaction_alerts", e.target.checked)}
                                />
                            </div>

                            <div className="form-switch-custom">
                                <span className="small fw-semibold">Promotional Offers</span>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={profile.promo_emails}
                                    onChange={(e) => handleToggleNotification("promo_emails", e.target.checked)}
                                />
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* SECTION 11: EMERGENCY CONTACT */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="section-title mb-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                    Emergency Contact
                                </div>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditModalOpen(true)}>Edit</button>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Contact Name</span>
                                    <span className="info-value">{profile.emergency_name || "Not Added"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Relationship</span>
                                    <span className="info-value">{profile.emergency_relation || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Phone</span>
                                    <span className="info-value">{profile.emergency_phone || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Address</span>
                                    <span className="info-value">{profile.emergency_address || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* SECTION 13: PREFERENCES */}
                        {/* ============================================================ */}
                        <div className="section-card">
                            <div className="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                Account Preferences
                            </div>

                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="info-label">Theme</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={profile.theme}
                                        onChange={(e) => handleToggleNotification("theme", e.target.value)}
                                    >
                                        <option value="dark">Dark Mode (Default)</option>
                                        <option value="light">Light Mode</option>
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="info-label">Language</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={profile.language}
                                        onChange={(e) => handleToggleNotification("language", e.target.value)}
                                    >
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi (हिंदी)</option>
                                        <option value="Tamil">Tamil (தமிழ்)</option>
                                    </select>
                                </div>
                                <div className="col-6 mt-2">
                                    <label className="info-label">Currency</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={profile.currency}
                                        onChange={(e) => handleToggleNotification("currency", e.target.value)}
                                    >
                                        <option value="INR (₹)">INR (₹)</option>
                                        <option value="USD ($)">USD ($)</option>
                                        <option value="EUR (€)">EUR (€)</option>
                                    </select>
                                </div>
                                <div className="col-6 mt-2">
                                    <label className="info-label">Time Zone</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={profile.time_zone}
                                        onChange={(e) => handleToggleNotification("time_zone", e.target.value)}
                                    >
                                        <option value="IST (UTC+5:30)">IST (UTC+5:30)</option>
                                        <option value="UTC">UTC</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* SECTION 14: DANGER ZONE - ACCOUNT CLOSURE */}
                        {/* ============================================================ */}
                        <div className="section-card danger-zone-card">
                            <div className="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                Danger Zone
                            </div>
                            <p className="small text-secondary mb-3">
                                Closing your banking profile is a permanent action. All secondary services will be terminated after verification.
                            </p>

                            {profile.closure_requested ? (
                                <div className="alert alert-warning m-0 small">
                                    Account closure request is currently pending bank review.
                                </div>
                            ) : (
                                <button
                                    className="btn btn-outline-danger btn-sm w-100"
                                    onClick={() => setIsClosureModalOpen(true)}
                                >
                                    Request Account Closure
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* MODALS */}
                {/* ============================================================ */}

                {/* 1. EDIT PROFILE MODAL */}
                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content-card" style={{ maxWidth: "680px" }}>
                            <div className="modal-header">
                                <h3>Edit Personal & Contact Details</h3>
                                <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleSaveProfile}>
                                <div className="row g-3 max-h-70vh overflow-auto">
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Full Name</label>
                                        <input type="text" className="form-control" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Mobile Phone</label>
                                        <input type="text" className="form-control" value={editForm.phone || ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Date of Birth</label>
                                        <input type="date" className="form-control" value={editForm.dob || ""} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Gender</label>
                                        <select className="form-select" value={editForm.gender || ""} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Father's Name</label>
                                        <input type="text" className="form-control" value={editForm.father_name || ""} onChange={(e) => setEditForm({ ...editForm, father_name: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Mother's Name</label>
                                        <input type="text" className="form-control" value={editForm.mother_name || ""} onChange={(e) => setEditForm({ ...editForm, mother_name: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Occupation</label>
                                        <input type="text" className="form-control" value={editForm.occupation || ""} onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Annual Income</label>
                                        <input type="text" className="form-control" value={editForm.annual_income || ""} onChange={(e) => setEditForm({ ...editForm, annual_income: e.target.value })} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small">Address Line 1</label>
                                        <input type="text" className="form-control" value={editForm.address_line1 || ""} onChange={(e) => setEditForm({ ...editForm, address_line1: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-4">
                                        <label className="form-label small">City</label>
                                        <input type="text" className="form-control" value={editForm.city || ""} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-4">
                                        <label className="form-label small">State</label>
                                        <input type="text" className="form-control" value={editForm.state || ""} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-4">
                                        <label className="form-label small">Pincode</label>
                                        <input type="text" className="form-control" value={editForm.pincode || ""} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Nominee Name</label>
                                        <input type="text" className="form-control" value={editForm.nominee_name || ""} onChange={(e) => setEditForm({ ...editForm, nominee_name: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label small">Nominee Relationship</label>
                                        <input type="text" className="form-control" value={editForm.nominee_relationship || ""} onChange={(e) => setEditForm({ ...editForm, nominee_relationship: e.target.value })} />
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 2. CHANGE PASSWORD MODAL */}
                {isPasswordModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content-card">
                            <div className="modal-header">
                                <h3>Change Security Password</h3>
                                <button className="modal-close-btn" onClick={() => setIsPasswordModalOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group mb-3">
                                    <label className="form-label small">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordForm.current_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label small">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordForm.new_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label small">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordForm.confirm_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                        required
                                    />
                                </div>

                                {passwordError && <div className="inline-error mb-3">{passwordError}</div>}

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Update Password</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 3. PHOTO MANAGEMENT MODAL */}
                {isPhotoModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content-card text-center">
                            <div className="modal-header">
                                <h3>Manage Profile Avatar</h3>
                                <button className="modal-close-btn" onClick={() => setIsPhotoModalOpen(false)}>&times;</button>
                            </div>

                            <div className="my-3 d-flex justify-content-center">
                                <div className="profile-avatar-wrapper" style={{ width: "120px", height: "120px" }}>
                                    {photoInput ? (
                                        <img src={photoInput} alt="Preview" className="profile-avatar-img" />
                                    ) : (
                                        <div className="profile-avatar-placeholder" style={{ fontSize: "40px" }}>
                                            {profile.name ? profile.name[0].toUpperCase() : "C"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="btn btn-outline-primary btn-sm mb-2 cursor-pointer">
                                    Upload New Picture
                                    <input type="file" accept="image/*" className="d-none" onChange={handlePhotoFileChange} />
                                </label>
                            </div>

                            <div className="d-flex justify-content-center gap-2">
                                {profile.profile_photo && (
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleSavePhoto("")}>
                                        Remove Avatar
                                    </button>
                                )}
                                <button className="btn btn-primary btn-sm" onClick={() => handleSavePhoto(photoInput)}>
                                    Save Photo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. KYC UPLOAD MODAL */}
                {isKycModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content-card">
                            <div className="modal-header">
                                <h3>Update KYC Verification Documents</h3>
                                <button className="modal-close-btn" onClick={() => setIsKycModalOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleSaveKyc}>
                                <div className="form-group mb-3">
                                    <label className="form-label small">Aadhaar Document Reference / File Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={kycForm.aadhaar}
                                        onChange={(e) => setKycForm({ ...kycForm, aadhaar: e.target.value })}
                                        placeholder="e.g. aadhaar_card_verified.pdf"
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label small">PAN Document Reference / File Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={kycForm.pan}
                                        onChange={(e) => setKycForm({ ...kycForm, pan: e.target.value })}
                                        placeholder="e.g. pan_card_verified.pdf"
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label small">Passport Reference (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={kycForm.passport}
                                        onChange={(e) => setKycForm({ ...kycForm, passport: e.target.value })}
                                        placeholder="e.g. passport_document.pdf"
                                    />
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setIsKycModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Submit Documents</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 5. VIEW DOCUMENT MODAL */}
                {viewDocModal.open && (
                    <div className="modal-overlay">
                        <div className="modal-content-card">
                            <div className="modal-header">
                                <h3>{viewDocModal.title}</h3>
                                <button className="modal-close-btn" onClick={() => setViewDocModal({ open: false, title: "", content: "" })}>&times;</button>
                            </div>
                            <div className="p-4 my-2 border rounded bg-body-tertiary text-center">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" className="mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                <h5>{viewDocModal.content}</h5>
                                <p className="text-secondary small">Status: Verified & Encrypted in Finova Vault</p>
                            </div>
                            <div className="d-flex justify-content-end">
                                <button className="btn btn-primary" onClick={() => setViewDocModal({ open: false, title: "", content: "" })}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. ACCOUNT CLOSURE CONFIRMATION MODAL */}
                {isClosureModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content-card">
                            <div className="modal-header">
                                <h3 className="text-danger">Request Account Closure</h3>
                                <button className="modal-close-btn" onClick={() => setIsClosureModalOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleRequestClosure}>
                                <p className="small text-secondary mb-3">
                                    Are you sure you want to request account closure? Please provide a reason for closure below:
                                </p>
                                <div className="form-group mb-3">
                                    <label className="form-label small">Reason for Closure</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={closureReason}
                                        onChange={(e) => setClosureReason(e.target.value)}
                                        placeholder="Please state why you want to close this account..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setIsClosureModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-danger">Confirm Closure Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

export default CustomerProfile;
