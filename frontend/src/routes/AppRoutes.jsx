import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import CustomerDashboard from "../pages/CustomerDashboard";
import Accounts from "../pages/Accounts";
import Transactions from "../pages/Transactions";
import Loans from "../pages/Loans";
import Support from "../pages/Support";
import AdminDashboard from "../pages/AdminDashboard";
import AdminCustomers from "../pages/AdminCustomers";
import AdminLoans from "../pages/AdminLoans";
import AdminTickets from "../pages/AdminTickets";
import AdminAccounts from "../pages/AdminAccounts";
import AdminTransactions from "../pages/AdminTransactions";
import Deposit from "../pages/Deposit";
import Withdraw from "../pages/Withdraw";
import Transfer from "../pages/Transfer";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/transactions"element={<Transactions />}/>
                <Route path="/loans"element={<Loans />}/>
                <Route path="/support"element={<Support />}/>
                <Route path="/admin-dashboard"element={<AdminDashboard />}/>
                <Route path="/admin-customers"element={<AdminCustomers />}/>
                <Route path="/admin-loans"element={<AdminLoans />}/>
                <Route path="/admin-tickets"element={<AdminTickets />}/>
                <Route path="/admin/accounts" element={<AdminAccounts />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
                <Route path="/deposit" element={<Deposit />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/transfer" element={<Transfer />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;