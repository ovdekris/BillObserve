import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Header from "./components/Header/Header.tsx";
import Register from "./pages/Register/Register.tsx";
import Login from "./pages/Login/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword/ResetPassword.tsx";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import Wallets from "./pages/Wallets/Wallets.tsx";
import Summary from "./pages/Summary/Summary.tsx";
import Goals from "./pages/Goals/Goals.tsx";
import Budgets from "./pages/Budgets/Budgets.tsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/reset-password/:token" element={<ResetPassword/>}/>
                <Route path="/transactions" element={<ProtectedRoute><Header/><Dashboard/></ProtectedRoute>}/>
                <Route path="/wallets" element={<ProtectedRoute><Header/><Wallets/></ProtectedRoute>}/>
                <Route path="/summary" element={<ProtectedRoute><Header/><Summary/></ProtectedRoute>}/>
                <Route path="/goals" element={<ProtectedRoute><Header/><Goals/></ProtectedRoute>}/>
                <Route path="/budgets" element={<ProtectedRoute><Header/><Budgets/></ProtectedRoute>}/>
                <Route path="/" element={<Navigate to="/login" replace/>}/>
                <Route path="/*" element={<Navigate to="/login" replace/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
