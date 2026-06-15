import React, { useState, useMemo } from 'react';
import {Car, Gamepad2, ShoppingBag, FileText,
    HeartPulse,
    BookOpen,
    Home,
    Shirt,
    MoreHorizontal,
    Briefcase,
    Gift,
    Plus,
    ArrowUpCircle,
    ArrowDownCircle,
    ArrowLeftRight,
    Search,
    X,
    Trash2,
    Check,
    Pencil
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
    "Zakupy": ShoppingBag,
    "Dzieci i edukacja": BookOpen,
    "Mieszkanie, dom i ogród": Home,
    "Osobiste": Shirt,
    "Podatki": FileText,
    "Prezenty i darowizny": Gift,
    "Rachunki i media": FileText,
    "Rozrywka": Gamepad2,
    "Samochód": Car,
    "Usługi biznesowe": Briefcase,
    "Zdrowie": HeartPulse,
    "Brak kategorii": MoreHorizontal,
};
export interface Transaction {
    _id: string;
    type: "expense" | "income" | "transfer";
    amount: number;
    date: string;
    description?: string;
    wallet: { _id: string; name: string };
    walletTo?: { _id: string; name: string };
    category?: { _id: string; name: string; icon: string; color: string };
}

function formatAmount(amount: number, type: Transaction["type"]) {
    const formatted = new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
    if (type === "income") return `+${formatted}`;
    if (type === "expense") return `-${formatted}`;
    return formatted;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function TypeIcon({ type }: { type: Transaction["type"] }) {
    if (type === "income")
        return <ArrowDownCircle size={18} className="text-emerald-500 flex-shrink-0" />;
    if (type === "expense")
        return <ArrowUpCircle size={18} className="text-red-400 flex-shrink-0" />;
    return <ArrowLeftRight size={18} className="text-gray-400 flex-shrink-0" />;
}

interface Props {
    transactions: Transaction[];
    loading: boolean;
    error: string;
    onAddClick: () => void;
    onDelete: (id: string) => Promise<void>;
    onEditClick: (tx: Transaction) => void;
}

function toMonthKey(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(key: string) {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    const label = date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function TransactionList({ transactions, loading, error, onAddClick, onDelete, onEditClick }: Props) {
    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (id: string) => {
        setDeleting(true);
        try {
            await onDelete(id);
        } finally {
            setDeleting(false);
            setConfirmId(null);
        }
    };

    const months = useMemo(() => {
        const set = new Set<string>();
        transactions.forEach(tx => set.add(toMonthKey(tx.date)));
        return Array.from(set).sort().reverse();
    }, [transactions]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return transactions.filter(tx => {
            const matchSearch = !q ||
                tx.description?.toLowerCase().includes(q) ||
                tx.category?.name.toLowerCase().includes(q) ||
                tx.wallet.name.toLowerCase().includes(q);
            const matchMonth = !selectedMonth || toMonthKey(tx.date) === selectedMonth;
            return matchSearch && matchMonth;
        });
    }, [transactions, search, selectedMonth]);

    return (
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-[var(--box-shadow)] min-h-screen border border-[var(--color-border-gray)]">
            <div className="flex items-center justify-between mb-4 px-5 py-4 border-b border-gray-100 rounded-t-2xl">
                <h1 className="text-2xl font-bold text-[var(--color-text)]">Transakcje</h1>
                <button
                    onClick={onAddClick}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-dark)] text-white rounded-xl font-medium hover:opacity-90 transition-all cursor-pointer"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex items-center gap-3 px-5 pb-4">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Szukaj po opisie, kategorii, portfelu…"
                        className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="py-2 px-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all text-gray-600 cursor-pointer"
                >
                    <option value="">Wszystkie miesiące</option>
                    {months.map(m => (
                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden">
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <svg className="animate-spin h-6 w-6 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                )}

                {error && (
                    <p className="px-5 py-4 text-sm text-red-500">{error}</p>
                )}

                {!loading && !error && transactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-[var(--color-bg)] rounded-full flex items-center justify-center mb-3">
                            <ArrowLeftRight size={24} className="text-gray-400" />
                        </div>
                        <p className="font-medium text-[var(--color-text)] mb-1">Brak transakcji</p>
                        <p className="text-sm text-gray-400">Dodaj pierwszą transakcję, żeby zacząć śledzić finanse</p>
                    </div>
                )}

                {!loading && !error && transactions.length > 0 && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-[var(--color-bg)] rounded-full flex items-center justify-center mb-3">
                            <Search size={24} className="text-gray-400" />
                        </div>
                        <p className="font-medium text-[var(--color-text)] mb-1">Brak wyników</p>
                        <p className="text-sm text-gray-400">Zmień kryteria wyszukiwania lub wybierz inny miesiąc</p>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wider">
                                <th className="px-5 py-3 font-medium text-black">Opis</th>
                                <th className="px-5 py-3 font-medium text-black">Kategoria</th>
                                <th className="px-5 py-3 font-medium text-black">Portfel</th>
                                <th className="px-5 py-3 font-medium text-black">Data</th>
                                <th className="px-5 py-3 font-medium text-right text-black">Kwota</th>
                                <th className="px-5 py-3 font-medium w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((tx, index) => {
                                const isLast = index === filtered.length - 1;
                                const CatIcon = tx.category ? ICON_MAP[tx.category.icon] : null;
                                const currentKey = toMonthKey(tx.date);
                                const prevKey = index > 0 ? toMonthKey(filtered[index - 1].date) : null;
                                const showMonthHeader = !selectedMonth && currentKey !== prevKey;

                                return (
                                    <React.Fragment key={tx._id}>
                                        {showMonthHeader && (
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <td colSpan={5} className="px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    {formatMonthLabel(currentKey)}
                                                </td>
                                            </tr>
                                        )}
                                        <tr
                                            className={`group hover:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-50" : ""}`}
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <TypeIcon type={tx.type} />
                                                    <span className="font-medium text-[var(--color-text)] truncate max-w-[160px]">
                                                        {tx.description || "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5">
                                                {tx.category ? (
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                                            style={{ backgroundColor: tx.category.color + "33" }}
                                                        >
                                                            {CatIcon
                                                                ? <CatIcon size={12} style={{ color: tx.category.color }} />
                                                                : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category.color }} />
                                                            }
                                                        </div>
                                                        <span className="text-gray-600 truncate max-w-[120px]">{tx.category.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-3.5 text-gray-500">
                                                {tx.type === "transfer" && tx.walletTo
                                                    ? `${tx.wallet.name} → ${tx.walletTo.name}`
                                                    : tx.wallet.name}
                                            </td>

                                            <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                                                {formatDate(tx.date)}
                                            </td>

                                            <td className={`px-5 py-3.5 text-right font-semibold whitespace-nowrap ${
                                                tx.type === "income"
                                                    ? "text-emerald-500"
                                                    : tx.type === "expense"
                                                    ? "text-red-500"
                                                    : "text-gray-500"
                                            }`}>
                                                {formatAmount(tx.amount, tx.type)} PLN
                                            </td>
                                            <td className="px-3 py-3.5 text-right">
                                                {confirmId === tx._id ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleDelete(tx._id)}
                                                            disabled={deleting}
                                                            className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors cursor-pointer disabled:opacity-50"
                                                            title="Potwierdź usunięcie"
                                                        >
                                                            <Check size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmId(null)}
                                                            disabled={deleting}
                                                            className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                                                            title="Anuluj"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => onEditClick(tx)}
                                                            className="p-1.5 rounded-lg text-gray-300 hover:text-[var(--color-primary)] hover:bg-blue-50 transition-colors cursor-pointer"
                                                            title="Edytuj transakcję"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmId(tx._id)}
                                                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                                                            title="Usuń transakcję"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
