const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem("token");
    return fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers as Record<string, string> | undefined),
        },
    });
}
