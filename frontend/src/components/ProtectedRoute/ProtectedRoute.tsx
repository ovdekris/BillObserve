import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

type Status = "loading" | "authenticated" | "unauthenticated";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setStatus("unauthenticated");
            return;
        }
        fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setStatus(res.ok ? "authenticated" : "unauthenticated"))
            .catch(() => setStatus("unauthenticated"));
    }, []);

    if (status === "loading") return null;
    if (status === "unauthenticated") return <Navigate to="/login" replace />;
    return <>{children}</>;
}

export default ProtectedRoute;
