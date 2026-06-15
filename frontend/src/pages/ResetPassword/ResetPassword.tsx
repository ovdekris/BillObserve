import {useState} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import Logo from "../../assets/logo/logo.svg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function ResetPassword() {
    const {token} = useParams<{token: string}>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({password: "", confirmPassword: ""});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.password) {
            newErrors.password = "Hasło jest wymagane";
        } else if (formData.password.length < 8) {
            newErrors.password = "Hasło musi mieć co najmniej 8 znaków";
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = "Hasło musi zawierać wielką literę";
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = "Hasło musi zawierać małą literę";
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = "Hasło musi zawierać cyfrę";
        } else if (!/[!@#$%^&*]/.test(formData.password)) {
            newErrors.password = "Hasło musi zawierać znak specjalny (!@#$%^&*)";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Powtórz hasło";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Hasła nie są identyczne";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
        if (errors[name]) setErrors((prev) => ({...prev, [name]: ""}));
        setApiError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        setApiError("");

        try {
            const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({password: formData.password}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Wystąpił błąd");
            }

            setIsSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : "Wystąpił błąd");
        } finally {
            setIsLoading(false);
        }
    };

    const EyeIcon = ({open}: {open: boolean}) => open ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );

    return (
        <div className="min-h-screen bg-[var(--color-accent)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mt-5">
                        <img src={Logo} alt="Spendly Logo" className="h-12 mx-auto invert"/>
                    </Link>
                </div>

                <div className="bg-white p-8 max-w-[560px] mx-auto rounded-[40px] mt-15">
                    {isSuccess ? (
                        <div className="text-center py-4">
                            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round" className="text-green-600">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                                Hasło zmienione!
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Twoje hasło zostało zaktualizowane. Za chwilę zostaniesz przekierowany do logowania.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block w-full py-3 px-4 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-all text-center"
                            >
                                Przejdź do logowania
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="mt-6 text-3xl font-bold text-[var(--color-text)] text-center">
                                Nowe hasło
                            </h1>
                            <p className="mt-2 text-gray-500 text-center">
                                Ustaw nowe hasło do swojego konta
                            </p>

                            {apiError && (
                                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                                    {apiError}
                                    {apiError.includes("wygasł") && (
                                        <span> <Link to="/forgot-password" className="underline font-medium">Wyślij nowy link.</Link></span>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                                {/* Nowe hasło */}
                                <div>
                                    <label htmlFor="password"
                                           className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                        Nowe hasło
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 pr-12 rounded-xl border bg-[var(--color-bg)] outline-none transition-all ${
                                                errors.password
                                                    ? "border-red-300 focus:border-red-500"
                                                    : "border-transparent focus:border-[var(--color-primary)]"
                                            }`}
                                            placeholder="Min. 8 znaków"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                            <EyeIcon open={showPassword}/>
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>

                                {/* Powtórz hasło */}
                                <div>
                                    <label htmlFor="confirmPassword"
                                           className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                        Powtórz hasło
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 pr-12 rounded-xl border bg-[var(--color-bg)] outline-none transition-all ${
                                                errors.confirmPassword
                                                    ? "border-red-300 focus:border-red-500"
                                                    : "border-transparent focus:border-[var(--color-primary)]"
                                            }`}
                                            placeholder="Powtórz nowe hasło"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                            <EyeIcon open={showConfirm}/>
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg"
                                                 fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                            </svg>
                                            Zapisywanie...
                                        </>
                                    ) : (
                                        "Ustaw nowe hasło"
                                    )}
                                </button>
                            </form>

                            <div className="my-6 flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-200"/>
                                <span className="text-sm text-gray-400">lub</span>
                                <div className="flex-1 h-px bg-gray-200"/>
                            </div>

                            <p className="text-center text-gray-500">
                                Pamiętasz hasło?{" "}
                                <Link to="/login"
                                      className="text-[var(--color-primary)] font-semibold hover:underline">
                                    Zaloguj się
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
