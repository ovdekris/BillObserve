import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Zap } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email jest wymagany";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Nieprawidłowy format email";
        }
        if (!formData.password) newErrors.password = "Hasło jest wymagane";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
        setApiError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        setApiError("");
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Błąd logowania");
            localStorage.setItem("token", data.token);
            window.location.href = "/transactions";
        } catch (error) {
            setApiError(error instanceof Error ? error.message : "Wystąpił błąd");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left — form */}
            <div className="w-full lg:w-1/2 bg-[#f5f4f9] flex flex-col items-center justify-center p-6 overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-7">
                    <div className="w-8 h-8 bg-[#7c5bf5] rounded-[9px] flex items-center justify-center">
                        <Zap size={17} color="#fff" fill="#fff" />
                    </div>
                    <span className="text-[18px] font-medium text-[#1a1135]">Spendly</span>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[18px] border border-gray-200 p-9 w-full max-w-[460px] shadow-[var(--box-shadow)]">
                    <h1 className="text-[22px] font-medium text-[#1a1135] text-center mb-1">Witaj z powrotem</h1>
                    <p className="text-[13px] text-gray-400 text-center mb-7">Zaloguj się do swojego konta</p>

                    {apiError && (
                        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-[12.5px] text-gray-500 mb-1.5">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="jan@example.com"
                                className={`w-full px-3.5 py-2.5 rounded-[10px] border bg-[#f5f4f9] text-[13.5px] text-[#1a1135] outline-none transition-all focus:bg-white ${
                                    errors.email
                                        ? "border-red-400 focus:border-red-500"
                                        : "border-gray-200 focus:border-[#7c5bf5]"
                                }`}
                            />
                            {errors.email && <p className="mt-1 text-[12px] text-red-500">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="text-[12.5px] text-gray-500">Hasło</label>
                                <Link to="/forgot-password" className="text-[12px] text-[#7c5bf5] hover:underline">
                                    Zapomniałeś hasła?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Twoje hasło"
                                    className={`w-full px-3.5 py-2.5 pr-10 rounded-[10px] border bg-[#f5f4f9] text-[13.5px] text-[#1a1135] outline-none transition-all focus:bg-white ${
                                        errors.password
                                            ? "border-red-400 focus:border-red-500"
                                            : "border-gray-200 focus:border-[#7c5bf5]"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-[12px] text-red-500">{errors.password}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-[11px] bg-[#7c5bf5] hover:bg-[#6a4ae0] text-white text-[14px] font-medium rounded-[10px] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Logowanie...
                                </>
                            ) : "Zaloguj się"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-2.5 my-[18px]">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[12px] text-gray-400">lub</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google */}
                    <button className="w-full py-2.5 bg-white border border-gray-200 rounded-[10px] text-[13px] text-gray-600 flex items-center justify-center gap-2 hover:bg-[#f5f4f9] transition-all cursor-pointer">
                        <GoogleIcon />
                        Kontynuuj z Google
                    </button>

                    <p className="text-center mt-5 text-[12.5px] text-gray-400">
                        Nie masz jeszcze konta?{" "}
                        <Link to="/register" className="text-[#7c5bf5] hover:underline">Zarejestruj się</Link>
                    </p>
                </div>
            </div>

            {/* Right — dark panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1a1135] relative flex-col items-center justify-center overflow-hidden">
                {/* Decorative animated dots */}
                <div className="dot-a absolute top-[40px] right-[30px] w-20 h-20 rounded-full bg-[#7c5bf5] opacity-15 pointer-events-none" />
                <div className="dot-b absolute bottom-[90px] left-[20px] w-[52px] h-[52px] rounded-full bg-[#7c5bf5] opacity-10 pointer-events-none" />
                <div className="dot-c absolute top-[45%] right-[12px] w-9 h-9 rounded-full bg-[#7c5bf5] opacity-10 pointer-events-none" />
                <div className="dot-d absolute bottom-[30%] left-[40px] w-14 h-14 rounded-full bg-[#a78bfa] opacity-10 pointer-events-none" />

                {/* Content */}
                <div className="flex flex-col items-center gap-4 w-full px-8 max-w-sm">
                    {/* Header */}
                    <div className="text-center mb-2">
                        <div className="w-12 h-12 bg-[#7c5bf5] rounded-[14px] flex items-center justify-center mx-auto mb-2.5">
                            <Zap size={24} color="#fff" fill="#fff" />
                        </div>
                        <p className="text-[16px] font-medium text-white">Twoje finanse, pod kontrolą</p>
                        <p className="text-[12px] text-white/40 mt-1">Śledź wydatki, planuj budżet, osiągaj cele</p>
                    </div>

                    {/* Main stat card */}
                    <div className="w-full bg-white/[0.07] border border-white/[0.12] rounded-[14px] px-5 py-4">
                        <p className="text-[11px] text-white/45 mb-1">Łączne saldo</p>
                        <p className="text-[20px] font-medium text-white">14 780,00 PLN</p>
                        <p className="text-[11px] text-white/35 mt-0.5">maj 2026 · 3 portfele</p>
                    </div>

                    {/* Mini cards */}
                    <div className="flex gap-2.5 w-full">
                        <div className="flex-1 bg-white/[0.07] border border-white/[0.12] rounded-[12px] px-3.5 py-3">
                            <p className="text-[10px] text-white/40 mb-0.5">Przychody</p>
                            <p className="text-[15px] font-medium text-white">0,00 PLN</p>
                            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full mt-1 bg-[#63991] text-[#97C459]" style={{ backgroundColor: "rgba(99,153,34,0.25)" }}>
                                +0%
                            </span>
                        </div>
                        <div className="flex-1 bg-white/[0.07] border border-white/[0.12] rounded-[12px] px-3.5 py-3">
                            <p className="text-[10px] text-white/40 mb-0.5">Wydatki</p>
                            <p className="text-[15px] font-medium text-white">1 220,00 PLN</p>
                            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full mt-1 text-[#F09595]" style={{ backgroundColor: "rgba(162,45,45,0.25)" }}>
                                ↑ 12%
                            </span>
                        </div>
                    </div>

                    <p className="text-[13px] text-white/40 text-center mt-2">Dołącz do tysięcy użytkowników Spendly</p>
                </div>
            </div>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
    );
}

export default Login;
