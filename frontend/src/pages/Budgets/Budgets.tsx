import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Power, LayoutGrid, Coins, AlertTriangle, Bell } from "lucide-react";
import BudgetModal, { type BudgetData } from "./BudgetModal.tsx";
import { apiFetch } from "../../utils/apiFetch.ts";

const PERIOD_LABEL: Record<string, string> = {
    weekly: "Tygodniowy",
    monthly: "Miesięczny",
    yearly: "Roczny",
};

const fmt = (n: number) =>
    new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function Budgets() {
    const [budgets, setBudgets] = useState<BudgetData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<BudgetData | null>(null);

    const fetchBudgets = useCallback(() => {
        setLoading(true);
        apiFetch("/budgets")
            .then(r => r.json())
            .then(j => setBudgets(j.data || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

    const deleteBudget = async (id: string) => {
        if (!confirm("Usunąć ten budżet?")) return;
        await apiFetch(`/budgets/${id}`, { method: "DELETE" });
        fetchBudgets();
    };

    const toggleBudget = async (id: string) => {
        await apiFetch(`/budgets/${id}/toggle`, { method: "PATCH" });
        fetchBudgets();
    };

    const filtered = budgets.filter(b => {
        if (filterActive === "active") return b.isActive;
        if (filterActive === "inactive") return !b.isActive;
        return true;
    });

    const activeBudgets   = budgets.filter(b => b.isActive);
    const totalLimit      = activeBudgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent      = activeBudgets.reduce((s, b) => s + b.spent, 0);
    const overBudgetCount = activeBudgets.filter(b => b.percentage > 100).length;

    return (
        <>
            {(showModal || editing) && (
                <BudgetModal
                    onClose={() => { setShowModal(false); setEditing(null); }}
                    onSuccess={() => { setShowModal(false); setEditing(null); fetchBudgets(); }}
                    initial={editing}
                />
            )}

            <div className="min-h-screen bg-[var(--color-bg)]">
                {/* Summary bar */}
                <div className="grid grid-cols-3 bg-[#ede9ff] border-b border-[#d4ccf7]">
                    <div className="flex items-center gap-3.5 px-8 py-5 border-r border-[#d4ccf7]">
                        <div className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                            <LayoutGrid size={18} className="text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-[13px] text-[#7c6eb5] mb-0.5">Łączny limit</p>
                            <p className="text-lg font-medium text-[#26215c]">{fmt(totalLimit)} PLN</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 px-8 py-5 border-r border-[#d4ccf7]">
                        <div className="w-[42px] h-[42px] rounded-xl bg-[#fdecea] flex items-center justify-center flex-shrink-0">
                            <Coins size={18} className="text-[#c0392b]" />
                        </div>
                        <div>
                            <p className="text-[13px] text-[#7c6eb5] mb-0.5">Wydane</p>
                            <p className="text-lg font-medium text-[#26215c]">{fmt(totalSpent)} PLN</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 px-8 py-5">
                        <div className="w-[42px] h-[42px] rounded-xl bg-[#fdf6e3] flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={18} className="text-[#b87514]" />
                        </div>
                        <div>
                            <p className="text-[13px] text-[#7c6eb5] mb-0.5">Przekroczone</p>
                            <p className="text-lg font-medium text-[#26215c]">{overBudgetCount} budżetów</p>
                        </div>
                    </div>
                </div>

                {/* Content card */}
                <div className="m-4 bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-[3px]">
                            {(["all", "active", "inactive"] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterActive(f)}
                                    className={`text-[13px] px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                                        filterActive === f
                                            ? "bg-white text-[var(--color-text)] font-medium border border-gray-200 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    {{ all: "Wszystkie", active: "Aktywne", inactive: "Nieaktywne" }[f]}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-1.5 bg-[var(--color-primary)] text-white text-[13px] font-medium px-3.5 py-[7px] rounded-lg hover:bg-[#6a4aeb] transition-all cursor-pointer"
                        >
                            <Plus size={14} /> Nowy budżet
                        </button>
                    </div>

                    {/* Budget list */}
                    {loading ? (
                        <Spinner />
                    ) : filtered.length === 0 ? (
                        <EmptyState onAdd={() => setShowModal(true)} />
                    ) : (
                        <ul>
                            {filtered.map(budget => {
                                const pct = Math.min(budget.percentage, 100);
                                const isOver = budget.percentage > 100;
                                const isWarning = budget.percentage >= budget.notifyAt && !isOver;

                                const barColor = isOver
                                    ? "#c0392b"
                                    : isWarning
                                        ? "#e5a020"
                                        : "var(--color-primary)";

                                const pctColor = isOver ? "#c0392b" : isWarning ? "#e5a020" : undefined;
                                const spentColor = isOver ? "#c0392b" : isWarning ? "#e5a020" : undefined;

                                const firstCat = budget.categories[0];

                                return (
                                    <li
                                        key={budget._id}
                                        className={`px-5 py-[18px] border-b border-gray-50 last:border-b-0 ${!budget.isActive ? "opacity-50" : ""}`}
                                    >
                                        {/* Top row */}
                                        <div className="flex items-start justify-between mb-2.5">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div
                                                    className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0 text-base"
                                                    style={{
                                                        backgroundColor: firstCat?.color ? `${firstCat.color}22` : "#f0edff",
                                                        color: firstCat?.color || "var(--color-primary)",
                                                    }}
                                                >
                                                    {budget.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 text-[15px] font-medium text-[var(--color-text)]">
                                                        {budget.name}
                                                        <span className="text-[11px] font-normal text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                                            {PERIOD_LABEL[budget.period]}
                                                        </span>
                                                    </div>
                                                    {budget.categories.length > 0 && (
                                                        <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-gray-400 flex-wrap">
                                                            {budget.categories.map(c => (
                                                                <span key={c._id} className="flex items-center gap-1">
                                                                    <span
                                                                        className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                                                                        style={{ backgroundColor: c.color || "#9715d0" }}
                                                                    />
                                                                    {c.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {budget.categories.length === 0 && budget.wallets.length > 0 && (
                                                        <p className="mt-0.5 text-[12px] text-gray-400">
                                                            {budget.wallets.map(w => w.name).join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3.5">
                                                {/* Amounts */}
                                                <div className="text-right">
                                                    <p className="text-[16px] font-medium" style={{ color: spentColor || "var(--color-text)" }}>
                                                        {fmt(budget.spent)} PLN
                                                    </p>
                                                    <p className="text-[12px] text-gray-400 mt-px">z {fmt(budget.amount)} PLN</p>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex items-center gap-0.5">
                                                    <button
                                                        title={budget.isActive ? "Dezaktywuj" : "Aktywuj"}
                                                        onClick={() => toggleBudget(budget._id)}
                                                        className="w-7 h-7 rounded-[7px] flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-pointer"
                                                    >
                                                        <Power size={14} />
                                                    </button>
                                                    <button
                                                        title="Edytuj"
                                                        onClick={() => setEditing(budget)}
                                                        className="w-7 h-7 rounded-[7px] flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1a7a46] transition-all cursor-pointer"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        title="Usuń"
                                                        onClick={() => deleteBudget(budget._id)}
                                                        className="w-7 h-7 rounded-[7px] flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-[#c0392b] transition-all cursor-pointer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div>
                                            <p className="text-[12px] font-medium text-right mb-1" style={{ color: pctColor || "#999" }}>
                                                {budget.percentage}%
                                            </p>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1.5 text-[12px] text-gray-400">
                                                <span>
                                                    Pozostało: <span className="font-medium text-[var(--color-text)]">{fmt(budget.remaining)} PLN</span>
                                                </span>
                                                {isWarning || isOver ? (
                                                    <span className="flex items-center gap-1" style={{ color: barColor }}>
                                                        <Bell size={11} />
                                                        {isOver ? "Limit przekroczony" : `Próg ${budget.notifyAt}% przekroczony`}
                                                    </span>
                                                ) : (
                                                    <span>Powiadom przy {budget.notifyAt}%</span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}

function Spinner() {
    return (
        <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-6 w-6 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
        </div>
    );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="text-center py-16 px-6">
            <div className="w-16 h-16 bg-[#f0edff] rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid size={28} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-text)] mb-1">Brak budżetów</h3>
            <p className="text-sm text-gray-400 mb-5">Ustaw limity wydatków, żeby kontrolować finanse</p>
            <button
                onClick={onAdd}
                className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all cursor-pointer"
            >
                Utwórz budżet
            </button>
        </div>
    );
}

export default Budgets;
