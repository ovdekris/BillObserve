import { useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../../utils/apiFetch.ts";

interface Props {
    goalId: string;
    goalName: string;
    currentAmount: number;
    targetAmount: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddProgressModal({ goalId, goalName, currentAmount, targetAmount, onClose, onSuccess }: Props) {
    const [amount, setAmount] = useState("");
    const [operation, setOperation] = useState<"add" | "subtract">("add");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fmt = (n: number) =>
        new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

    const remaining = targetAmount - currentAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await apiFetch(`/goals/${goalId}/progress`, {
                method: "PATCH",
                body: JSON.stringify({ amount: parseFloat(amount), operation }),
            });
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-[var(--color-text)]">Aktualizuj postęp</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div className="bg-[var(--color-bg)] rounded-xl p-4">
                        <p className="text-sm font-medium text-[var(--color-text)] mb-1 truncate">{goalName}</p>
                        <p className="text-xs text-gray-400">
                            {fmt(currentAmount)} / {fmt(targetAmount)} PLN · do celu brakuje {fmt(remaining)} PLN
                        </p>
                    </div>

                    <div className="flex rounded-xl overflow-hidden border border-gray-200">
                        <button type="button" onClick={() => setOperation("add")}
                            className={`flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer ${operation === "add" ? "bg-[var(--color-success)] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                            + Dodaj
                        </button>
                        <button type="button" onClick={() => setOperation("subtract")}
                            className={`flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer ${operation === "subtract" ? "bg-[var(--color-danger)] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                            − Odejmij
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kwota (PLN) *</label>
                        <input
                            required
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0,00"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm"
                            autoFocus
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
                            Anuluj
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-60">
                            {loading ? "Zapisuję..." : "Zapisz"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
