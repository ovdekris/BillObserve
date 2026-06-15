import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../../utils/apiFetch.ts";

interface Category {
    _id: string;
    name: string;
    color: string;
}

interface Wallet {
    _id: string;
    name: string;
}

export interface BudgetData {
    _id: string;
    name: string;
    amount: number;
    period: "weekly" | "monthly" | "yearly";
    categories: { _id: string; name: string; color: string }[];
    wallets: { _id: string; name: string }[];
    notifyAt: number;
    isActive: boolean;
    spent: number;
    remaining: number;
    percentage: number;
    startDate: string;
    endDate?: string;
}

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    initial?: BudgetData | null;
}

export default function BudgetModal({ onClose, onSuccess, initial }: Props) {
    const [name, setName] = useState(initial?.name ?? "");
    const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
    const [period, setPeriod] = useState<string>(initial?.period ?? "monthly");
    const [notifyAt, setNotifyAt] = useState(String(initial?.notifyAt ?? 80));
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initial?.categories.map(c => c._id) ?? []
    );
    const [selectedWallets, setSelectedWallets] = useState<string[]>(
        initial?.wallets.map(w => w._id) ?? []
    );

    const [categories, setCategories] = useState<Category[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            apiFetch("/categories").then(r => r.json()),
            apiFetch("/wallets").then(r => r.json()),
        ]).then(([cats, wals]) => {
            setCategories(cats.data || []);
            setWallets(wals.data || []);
        });
    }, []);

    const toggleCategory = (id: string) =>
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );

    const toggleWallet = (id: string) =>
        setSelectedWallets(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const body = {
                name,
                amount: parseFloat(amount),
                period,
                notifyAt: parseInt(notifyAt),
                categories: selectedCategories,
                wallets: selectedWallets,
            };
            const res = await apiFetch(
                initial ? `/budgets/${initial._id}` : "/budgets",
                { method: initial ? "PUT" : "POST", body: JSON.stringify(body) }
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Błąd zapisu");
            onSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Błąd zapisu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[var(--z-modal)] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-[var(--color-text)]">
                        {initial ? "Edytuj budżet" : "Nowy budżet"}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {/* Nazwa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa *</label>
                        <input
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="np. Jedzenie, Rozrywka..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm"
                        />
                    </div>

                    {/* Kwota + Okres */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Limit (PLN) *</label>
                            <input
                                required
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0,00"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Okres</label>
                            <select
                                value={period}
                                onChange={e => setPeriod(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm bg-white"
                            >
                                <option value="weekly">Tygodniowy</option>
                                <option value="monthly">Miesięczny</option>
                                <option value="yearly">Roczny</option>
                            </select>
                        </div>
                    </div>

                    {/* Próg powiadomienia */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Powiadom przy {notifyAt}% wykorzystania
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={notifyAt}
                            onChange={e => setNotifyAt(e.target.value)}
                            className="w-full accent-[var(--color-primary)]"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0%</span><span>50%</span><span>100%</span>
                        </div>
                    </div>

                    {/* Kategorie */}
                    {categories.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategorie <span className="text-gray-400 font-normal">(opcjonalnie — puste = wszystkie)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(c => (
                                    <button
                                        key={c._id}
                                        type="button"
                                        onClick={() => toggleCategory(c._id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                                            selectedCategories.includes(c._id)
                                                ? "border-[var(--color-primary)] bg-purple-50 text-[var(--color-primary)]"
                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: c.color || "#9715d0" }}
                                        />
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Portfele */}
                    {wallets.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Portfele <span className="text-gray-400 font-normal">(opcjonalnie — puste = wszystkie)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {wallets.map(w => (
                                    <button
                                        key={w._id}
                                        type="button"
                                        onClick={() => toggleWallet(w._id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                                            selectedWallets.includes(w._id)
                                                ? "border-[var(--color-primary)] bg-purple-50 text-[var(--color-primary)]"
                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        {w.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
                        >
                            {loading ? "Zapisuję..." : initial ? "Zapisz zmiany" : "Utwórz budżet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
