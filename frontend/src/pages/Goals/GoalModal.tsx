import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../../utils/apiFetch.ts";

interface Wallet {
    _id: string;
    name: string;
    currency: string;
}

export interface GoalData {
    _id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    priority: "low" | "medium" | "high";
    status: "active" | "completed" | "cancelled";
    description?: string;
    wallet?: { _id: string; name: string; currency: string };
    progress: number;
}

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    initial?: GoalData | null;
}

const EMPTY = {
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    priority: "medium",
    wallet: "",
    description: "",
};

export default function GoalModal({ onClose, onSuccess, initial }: Props) {
    const [form, setForm] = useState({
        name: initial?.name ?? EMPTY.name,
        targetAmount: initial ? String(initial.targetAmount) : EMPTY.targetAmount,
        currentAmount: initial ? String(initial.currentAmount) : EMPTY.currentAmount,
        deadline: initial?.deadline ? initial.deadline.slice(0, 10) : EMPTY.deadline,
        priority: initial?.priority ?? EMPTY.priority,
        wallet: initial?.wallet?._id ?? EMPTY.wallet,
        description: initial?.description ?? EMPTY.description,
    });
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        apiFetch("/wallets").then(r => r.json()).then(j => setWallets(j.data || []));
    }, []);

    const set = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const body: Record<string, unknown> = {
                name: form.name,
                targetAmount: parseFloat(form.targetAmount),
                currentAmount: form.currentAmount ? parseFloat(form.currentAmount) : 0,
                priority: form.priority,
                deadline: form.deadline || undefined,
                wallet: form.wallet || undefined,
                description: form.description || undefined,
            };
            const res = await apiFetch(
                initial ? `/goals/${initial._id}` : "/goals",
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-[var(--color-text)]">
                        {initial ? "Edytuj cel" : "Nowy cel"}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa *</label>
                        <input
                            required
                            value={form.name}
                            onChange={e => set("name", e.target.value)}
                            placeholder="np. Wakacje, Nowy laptop..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cel (PLN) *</label>
                            <input
                                required
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.targetAmount}
                                onChange={e => set("targetAmount", e.target.value)}
                                placeholder="0,00"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Już mam (PLN)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.currentAmount}
                                onChange={e => set("currentAmount", e.target.value)}
                                placeholder="0,00"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Termin</label>
                            <input
                                type="date"
                                value={form.deadline}
                                onChange={e => set("deadline", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priorytet</label>
                            <select
                                value={form.priority}
                                onChange={e => set("priority", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm bg-white"
                            >
                                <option value="low">Niski</option>
                                <option value="medium">Średni</option>
                                <option value="high">Wysoki</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Portfel</label>
                        <select
                            value={form.wallet}
                            onChange={e => set("wallet", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm bg-white"
                        >
                            <option value="">— brak —</option>
                            {wallets.map(w => (
                                <option key={w._id} value={w._id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                        <textarea
                            value={form.description}
                            onChange={e => set("description", e.target.value)}
                            rows={2}
                            placeholder="Opcjonalny opis..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm resize-none"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-2">
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
                            {loading ? "Zapisuję..." : initial ? "Zapisz zmiany" : "Dodaj cel"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
