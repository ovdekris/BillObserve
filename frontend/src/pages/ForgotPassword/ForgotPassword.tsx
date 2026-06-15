import {useState} from "react";
import {Link} from "react-router-dom";
import Logo from "../../assets/logo/logo.svg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validate = () => {
        if (!email.trim()) {
            setEmailError("Email jest wymagany");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Nieprawidłowy format email");
            return false;
        }
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailError("");
        setApiError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        setApiError("");

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Wystąpił błąd");
            }

            setIsSuccess(true);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : "Wystąpił błąd");
        } finally {
            setIsLoading(false);
        }
    };

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
                            <div className="flex items-center justify-center w-16 h-16 bg-[var(--color-primary)] rounded-full mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                                     fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                                Sprawdź skrzynkę
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Jeśli konto z adresem <span className="font-medium text-[var(--color-text)]">{email}</span> istnieje,
                                wyślemy na niego link do resetowania hasła.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block w-full py-3 px-4 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-all text-center"
                            >
                                Wróć do logowania
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="mt-6 text-3xl font-bold text-[var(--color-text)] text-center">
                                Resetuj hasło
                            </h1>
                            <p className="mt-2 text-gray-500 text-center">
                                Podaj email, a wyślemy Ci link do zmiany hasła
                            </p>

                            {apiError && (
                                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                                    {apiError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-[var(--color-text)] mb-2"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border bg-[var(--color-bg)] outline-none transition-all ${
                                            emailError
                                                ? "border-red-300 focus:border-red-500"
                                                : "border-transparent focus:border-[var(--color-primary)]"
                                        }`}
                                        placeholder="jan@example.com"
                                    />
                                    {emailError && (
                                        <p className="mt-1.5 text-sm text-red-500">{emailError}</p>
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
                                            Wysyłanie...
                                        </>
                                    ) : (
                                        "Wyślij link"
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
                                <Link
                                    to="/login"
                                    className="text-[var(--color-primary)] font-semibold hover:underline"
                                >
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

export default ForgotPassword;
