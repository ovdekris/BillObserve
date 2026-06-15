import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../../../utils/apiFetch.ts";

interface Wallet {
    _id: string;
    name: string;
    currency: string;
}

interface Subcategory {
    _id: string;
    name: string;
    color: string;
}

interface Category {
    _id: string;
    name: string;
    color: string;
    icon: string;
    subcategories: Subcategory[];
}

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

function AddTransactionModal({ onClose, onSuccess }: Props) {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [type, setType] = useState<"expense" | "income">("expense");
    const [form, setForm] = useState({
        description: "",
        date: new Date().toISOString().slice(0, 10),
        wallet: "",
        amount: "",
        category: "",
        subcategory: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchWallets = apiFetch(`/wallets`)
            .then(r => r.json()).then(j => j.data as Wallet[]);

        const fetchCategories = (t: string) =>
            apiFetch(`/categories/type/${t}`)
                .then(r => r.json()).then(j => j.data as Category[]);

        fetchWallets.then(setWallets);
        fetchCategories(type).then(setCategories);
    }, []);

    useEffect(() => {
        apiFetch(`/categories/type/${type}`)
            .then(r => r.json())
            .then(j => {
                setCategories(j.data as Category[]);
                setForm(f => ({ ...f, category: "", subcategory: "" }));
            });
    }, [type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.wallet) { setError("Wybierz portfel"); return; }
        if (!form.amount || Number(form.amount) <= 0) { setError("Podaj prawidłową kwotę"); return; }

        setSubmitting(true);
        setError("");

        try {
            const res = await apiFetch(`/transactions`, {
                method: "POST",
                body: JSON.stringify({
                    description: form.description,
                    date: form.date,
                    wallet: form.wallet,
                    amount: Number(form.amount),
                    type,
                    category: form.subcategory || form.category || undefined,
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

    const selectedCategory = categories.find(c => c._id === form.category);
    const selectedSubcategory = selectedCategory?.subcategories.find(s => s._id === form.subcategory);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[var(--color-text)]">Dodaj transakcję</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nazwa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Nazwa</label>
                            <input
                                type="text"
                                placeholder="Np. zakupy"
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)]"
                            />
                        </div>

                        {/* Data */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Data</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)]"
                            />
                        </div>

                        {/* Typ */}
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={type === "expense"}
                                    onChange={() => setType("expense")}
                                    className="w-4 h-4 accent-[var(--color-primary)]"
                                />
                                <span className="font-medium text-[var(--color-text)]">Wydatek</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={type === "income"}
                                    onChange={() => setType("income")}
                                    className="w-4 h-4 accent-[var(--color-primary)]"
                                />
                                <span className="font-medium text-gray-400">Przychód</span>
                            </label>
                        </div>

                        {/* Portfel */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Wybierz portfel</label>
                            <select
                                value={form.wallet}
                                onChange={e => setForm(f => ({ ...f, wallet: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)] appearance-none bg-white cursor-pointer"
                                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                            >
                                <option value="">Wybierz portfel</option>
                                {wallets.map(w => (
                                    <option key={w._id} value={w._id}>{w.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Kwota */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Kwota</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={form.amount}
                                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                    className="w-full px-4 py-3 pr-16 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)]"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">PLN</span>
                            </div>
                        </div>

                        {/* Kategoria */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Wybierz kategorię</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <div
                                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                        style={{
                                            borderColor: selectedCategory?.color || "#d1d5db",
                                            backgroundColor: selectedCategory ? selectedCategory.color + "22" : "transparent"
                                        }}
                                    >
                                        {selectedCategory && (
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                                        )}
                                    </div>
                                </div>
                                <select
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: "" }))}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)] appearance-none bg-white cursor-pointer"
                                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                                >
                                    <option value="">Brak kategorii</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedCategory && selectedCategory.subcategories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Wybierz podkategorię</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <div
                                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                            style={{
                                                borderColor: selectedSubcategory?.color || selectedCategory.color || "#d1d5db",
                                                backgroundColor: selectedSubcategory
                                                    ? (selectedSubcategory.color || selectedCategory.color) + "22"
                                                    : "transparent"
                                            }}
                                        >
                                            {selectedSubcategory && (
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedSubcategory.color || selectedCategory.color }} />
                                            )}
                                        </div>
                                    </div>
                                    <select
                                        value={form.subcategory}
                                        onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text)] appearance-none bg-white cursor-pointer"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                                    >
                                        <option value="">Brak podkategorii</option>
                                        {selectedCategory.subcategories.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}

                        {/* Przyciski */}
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
                                {submitting ? "Zapisywanie..." : "Dodaj"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddTransactionModal;
