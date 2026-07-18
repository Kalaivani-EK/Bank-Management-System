import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <div
            style={{
                width: "250px",
                height: "100vh",
                backgroundColor: "#1e3a8a",
                color: "white",
                padding: "20px"
            }}
        >
            <h2>Bank System</h2>

            <ul style={{ listStyle: "none", padding: 0 }}>

                <li><Link to="/dashboard">Dashboard</Link></li>

                <li><Link to="/accounts">Accounts</Link></li>

                <li><Link to="/transactions">Transactions</Link></li>

                <li><Link to="/loans">Loans</Link></li>

                <li><Link to="/support">Support</Link></li>

                <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>

                <li><Link to="/admin-customers">Customers</Link></li>

                <li><Link to="/admin-loans">Loans Approval</Link></li>

                <li><Link to="/admin-tickets">Tickets</Link></li>

            </ul>

        </div>
    );
}

export default Sidebar;