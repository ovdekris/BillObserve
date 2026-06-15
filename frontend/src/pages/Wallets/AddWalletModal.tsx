import { useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../../utils/apiFetch.ts";

const WALLET_TYPES = [
    { value: "cash", label: "Gotówka" },
    { value: "bank", label: "Konto bankowe" },
    { value: "credit_card", label: "Karta kredytowa" },
    { value: "savings", label: "Oszczędności" },
    { value: "investment", label: "Inwestycje" },
    { value: "other", label: "Inne" },
];

const CURRENCIES = ["PLN", "EUR", "USD", "GBP"];

const PRESET_COLORS = [
    "#2ECC71", "#3498DB", "#9B59B6", "#E74C3C",
    "#F39C12", "#1ABC9C", "#E67E22", "#34495E",
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
];

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

function AddWalletModal({ onClose, onSuccess }: Props) {
    const [form, setForm] = useState({
        name: "",
        type: "bank",
        balance: "",
        currency: "PLN",
        color: "#3498DB",
        includeInTotal: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const set = (field: string, value: unknown) =>
        setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("Podaj nazwę portfela"); return; }

        setSubmitting(true);
        setError("");

        try {
            const res = await apiFetch(`/wallets`, {
                method: "POST",
                body: JSON.stringify({
                    name: form.name.trim(),
                    type: form.type,
                    balance: Number(form.balance) || 0,
                    currency: form.currency,
                    color: form.color,
                    includeInTotal: form.includeInTotal,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Błąd zapisu");
            onSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Błąd zapisu");
        } finally {
            setSubmitting(false);
        }
    };

    const selectStyle = {
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat" as const,
        backgroundPosition: "right 16px center",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[var(--color-text)]">Nowy portfel</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nazwa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Nazwa</label>
                            <input
                                type="text"
                                placeholder="Np. Konto główne"
                                value={form.name}
                                onChange={e => set("name", e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)]"
                            />
                        </div>

                        {/* Typ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Typ</label>
                            <select
                                value={form.type}
                                onChange={e => set("type", e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)] appearance-none bg-white cursor-pointer"
                                style={selectStyle}
                            >
                                {WALLET_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Saldo i waluta */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Saldo początkowe</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={form.balance}
                                    onChange={e => set("balance", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)]"
                                />
                            </div>
                            <div className="w-28">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Waluta</label>
                                <select
                                    value={form.currency}
                                    onChange={e => set("currency", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)] appearance-none bg-white cursor-pointer"
                                    style={selectStyle}
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Kolor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Kolor</label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => set("color", color)}
                                        className="w-8 h-8 rounded-full transition-transform hover:scale-110 cursor-pointer"
                                        style={{
                                            backgroundColor: color,
                                            outline: form.color === color ? `3px solid ${color}` : "none",
                                            outlineOffset: "2px",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Wlicz do sumy */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div
                                onClick={() => set("includeInTotal", !form.includeInTotal)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${form.includeInTotal ? "bg-[var(--color-primary)]" : "bg-gray-200"}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.includeInTotal ? "translate-x-5" : "translate-x-0.5"}`} />
                            </div>
                            <span className="text-sm font-medium text-[var(--color-text)]">Wlicz do łącznego salda</span>
                        </label>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl font-medium bg-[var(--color-bg)] text-[var(--color-primary)] hover:bg-gray-200 transition-all cursor-pointer"
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-3 rounded-xl font-medium bg-[var(--color-primary)] text-white hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
                            >
                                {submitting ? "Zapisywanie..." : "Utwórz"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddWalletModal;
