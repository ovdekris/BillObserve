import { useEffect, useState, useCallback } from "react";
import { Plus, Target, Trophy, PiggyBank, Pencil, Trash2, PlusCircle, Clock } from "lucide-react";
import GoalModal, { type GoalData } from "./GoalModal.tsx";
import AddProgressModal from "./AddProgressModal.tsx";
import { apiFetch } from "../../utils/apiFetch.ts";

const PRIORITY_META = {
    low:    { label: "niski",   color: "#9ca3af" },
    medium: { label: "średni",  color: "#f59e0b" },
    high:   { label: "wysoki",  color: "#ef4444" },
};

const STATUS_META = {
    active:    { label: "Aktywny",   bg: "#e8f4fd", color: "#185fa5" },
    completed: { label: "Ukończony", bg: "#e8fdf0", color: "#1a7a46" },
    cancelled: { label: "Anulowany", bg: "#f3f4f6", color: "#9ca3af" },
};

const fmt = (n: number) =>
    new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const PRIORITY_AVATAR_BG: Record<string, string> = {
    low:    "#f3f4f6",
    medium: "#fdf6e3",
    high:   "#fdecea",
};
const PRIORITY_AVATAR_COLOR: Record<string, string> = {
    low:    "#6b7280",
    medium: "#b87514",
    high:   "#c0392b",
};

function Goals() {
    const [goals, setGoals] = useState<GoalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("active");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<GoalData | null>(null);
    const [progressGoal, setProgressGoal] = useState<GoalData | null>(null);

    const fetchGoals = useCallback(() => {
        setLoading(true);
        const qs = filterStatus !== "all" ? `?status=${filterStatus}` : "";
        apiFetch(`/goals${qs}`)
            .then(r => r.json())
            .then(j => setGoals(j.data || []))
            .finally(() => setLoading(false));
    }, [filterStatus]);

    useEffect(() => { fetchGoals(); }, [fetchGoals]);

    const deleteGoal = async (id: string) => {
        if (!confirm("Usunąć ten cel?")) return;
        await apiFetch(`/goals/${id}`, { method: "DELETE" });
        fetchGoals();
    };

    const totalTarget  = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
    const completed    = goals.filter(g => g.status === "completed").length;

    return (
        <>
            {(showModal || editing) && (
                <GoalModal
                    onClose={() => { setShowModal(false); setEditing(null); }}
                    onSuccess={() => { setShowModal(false); setEditing(null); fetchGoals(); }}
                    initial={editing}
                />
            )}
            {progressGoal && (
                <AddProgressModal
                    goalId={progressGoal._id}
                    goalName={progressGoal.name}
                    currentAmount={progressGoal.currentAmount}
                    targetAmount={progressGoal.targetAmount}
                    onClose={() => setProgressGoal(null)}
                    onSuccess={() => { setProgressGoal(null); fetchGoals(); }}
                />
            )}

            <div className="min-h-screen bg-[var(--color-bg)]">
                {/* Summary bar */}
                <div className="grid grid-cols-3 bg-[#ede9ff] border-b border-[#d4ccf7]">
                    <div className="flex items-center gap-3.5 px-8 py-5 border-r border-[#d4ccf7]">
                        <div className="w-[42px] h-[42px] rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                            <Target size={18} className="text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-[13px] text-[#7c6eb5] mb-0.5">Łączny cel</p>
                            <p className="text-lg font-medium text-[#26215c]">{fmt(totalTarget)} PLN</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 px-8 py-5 border-r border-[#d4ccf7]">
                        <div className="w-[42px] h-[42px] rounded-xl bg-[#e8fdf0] flex items-center justify-center flex-shrink-0">
                            <PiggyBank size={18} className="text-[#1a7a46]" />
                        </div>
                        <div>
                            <p className="text-[13px] text-[#7c6eb5] mb-0.5">Odłożone</p>
                            <p className="text-lg font-medium text-[#26215c]">{fmt(totalCurrent)} PLN</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 px-8 py-5">
                        <div className="w-[42px] h-[42px] rounded-xl bg-[#fdf6e3] flex items-center justify-center flex-shrink-0">
                            <Trophy size={18} className="text-[#b87514]" />
                        </div>
                        <div>
                            <p className="text-[13px] text-[#7c6eb5] mb-0.5">Ukończone</p>
                            <p className="text-lg font-medium text-[#26215c]">{completed} celów</p>
                        </div>
                    </div>
                </div>

                {/* Content card */}
                <div className="m-4 bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-[3px]">
                            {(["all", "active", "completed", "cancelled"] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`text-[13px] px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                                        filterStatus === s
                                            ? "bg-white text-[var(--color-text)] font-medium border border-gray-200 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    {{ all: "Wszystkie", active: "Aktywne", completed: "Ukończone", cancelled: "Anulowane" }[s]}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-1.5 bg-[var(--color-primary)] text-white text-[13px] font-medium px-3.5 py-[7px] rounded-lg hover:bg-[#6a4aeb] transition-all cursor-pointer"
                        >
                            <Plus size={14} /> Nowy cel
                        </button>
                    </div>

                    {/* Goal list */}
                    {loading ? (
                        <Spinner />
                    ) : goals.length === 0 ? (
                        <EmptyState onAdd={() => setShowModal(true)} />
                    ) : (
                        <ul>
                            {goals.map(goal => {
                                const pri = PRIORITY_META[goal.priority];
                                const sta = STATUS_META[goal.status];
                                const isCompleted = goal.status === "completed";
                                const barColor = isCompleted ? "#1a7a46" : "var(--color-primary)";

                                const daysLeft = goal.deadline
                                    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
                                    : null;

                                const deadlineColor =
                                    daysLeft === null ? undefined :
                                    daysLeft < 0 ? "#c0392b" :
                                    daysLeft < 14 ? "#e5a020" : undefined;

                                return (
                                    <li key={goal._id} className="px-5 py-[18px] border-b border-gray-50 last:border-b-0">
                                        {/* Top row */}
                                        <div className="flex items-start justify-between mb-2.5">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div
                                                    className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0 text-base font-medium"
                                                    style={{
                                                        backgroundColor: PRIORITY_AVATAR_BG[goal.priority],
                                                        color: PRIORITY_AVATAR_COLOR[goal.priority],
                                                    }}
                                                >
                                                    {goal.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[15px] font-medium text-[var(--color-text)]">
                                                            {goal.name}
                                                        </span>
                                                        <span
                                                            className="text-[11px] font-normal px-2 py-0.5 rounded-full border"
                                                            style={{
                                                                backgroundColor: sta.bg,
                                                                color: sta.color,
                                                                borderColor: sta.bg,
                                                            }}
                                                        >
                                                            {sta.label}
                                                        </span>
                                                        <span className="text-[11px] font-medium" style={{ color: pri.color }}>
                                                            ↑ {pri.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-0.5 flex-wrap text-[12px] text-gray-400">
                                                        {goal.wallet && (
                                                            <span>Portfel: {goal.wallet.name}</span>
                                                        )}
                                                        {daysLeft !== null && (
                                                            <span className="flex items-center gap-1" style={{ color: deadlineColor }}>
                                                                <Clock size={11} />
                                                                {daysLeft < 0
                                                                    ? `Po terminie o ${Math.abs(daysLeft)} dni`
                                                                    : daysLeft === 0
                                                                    ? "Termin dzisiaj"
                                                                    : `${daysLeft} dni do terminu`}
                                                            </span>
                                                        )}
                                                        {goal.description && (
                                                            <span className="truncate max-w-xs">{goal.description}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3.5">
                                                {/* Amounts */}
                                                <div className="text-right">
                                                    <p className="text-[16px] font-medium text-[var(--color-text)]">
                                                        {fmt(goal.currentAmount)} PLN
                                                    </p>
                                                    <p className="text-[12px] text-gray-400 mt-px">z {fmt(goal.targetAmount)} PLN</p>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex items-center gap-0.5">
                                                    {goal.status === "active" && (
                                                        <button
                                                            title="Dodaj środki"
                                                            onClick={() => setProgressGoal(goal)}
                                                            className="w-7 h-7 rounded-[7px] flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-[#1a7a46] transition-all cursor-pointer"
                                                        >
                                                            <PlusCircle size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        title="Edytuj"
                                                        onClick={() => setEditing(goal)}
                                                        className="w-7 h-7 rounded-[7px] flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1a7a46] transition-all cursor-pointer"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        title="Usuń"
                                                        onClick={() => deleteGoal(goal._id)}
                                                        className="w-7 h-7 rounded-[7px] flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-[#c0392b] transition-all cursor-pointer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div>
                                            <p className="text-[12px] font-medium text-right mb-1 text-gray-400">
                                                {goal.progress}%
                                            </p>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(goal.progress, 100)}%`, backgroundColor: barColor }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1.5 text-[12px] text-gray-400">
                                                <span>
                                                    Odłożono: <span className="font-medium text-[var(--color-text)]">{fmt(goal.currentAmount)} PLN</span>
                                                </span>
                                                <span>cel: {fmt(goal.targetAmount)} PLN</span>
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
                <Target size={28} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-text)] mb-1">Brak celów oszczędnościowych</h3>
            <p className="text-sm text-gray-400 mb-5">Wyznacz cel i śledź postępy w oszczędzaniu</p>
            <button
                onClick={onAdd}
                className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all cursor-pointer"
            >
                Dodaj pierwszy cel
            </button>
        </div>
    );
}

export default Goals;
