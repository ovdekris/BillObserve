import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Database, ArrowRight } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line,
    PieChart, Pie, Cell
} from "recharts";
import { apiFetch } from "../../utils/apiFetch.ts";

interface Wallet {
    _id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    color: string;
}

interface Stats {
    income: number;
    expense: number;
    transfer: number;
    balance: number;
}

interface CategoryStat {
    _id: string;
    name: string;
    color: string;
    total: number;
}

interface MonthlyPoint {
    label: string;
    income: number;
    expense: number;
}

const POLISH_MONTHS = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];

const CHART_TYPE_LABELS: Record<string, string> = { bar: "Słupkowy", line: "Liniowy" };

function fmt(amount: number) {
    return new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function monthRange(year: number, month: number): { startDate: string; endDate: string } {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
    };
}

export default function Summary() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
    const [annualData, setAnnualData] = useState<MonthlyPoint[]>([]);
    const [chartType, setChartType] = useState<"bar" | "line">("bar");
    const [loading, setLoading] = useState(true);

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const { startDate, endDate } = monthRange(year, month);

        try {
            const [walletsRes, statsRes, catRes, annualTransRes] = await Promise.all([
                apiFetch("/wallets").then(r => r.json()),
                apiFetch(`/transactions/stats?startDate=${startDate}&endDate=${endDate}`).then(r => r.json()),
                apiFetch(`/transactions/by-category?startDate=${startDate}&endDate=${endDate}&type=expense`).then(r => r.json()),
                apiFetch(`/transactions?startDate=${year}-01-01&endDate=${year}-12-31&limit=1000`).then(r => r.json()),
            ]);

            setWallets(walletsRes.data ?? []);
            setStats(statsRes.data ?? null);
            setCategoryStats(catRes.data ?? []);

            const txs: Array<{ date: string; type: string; amount: number }> = annualTransRes.data ?? [];
            const points: MonthlyPoint[] = POLISH_MONTHS.map((label, i) => {
                const monthTxs = txs.filter(tx => new Date(tx.date).getMonth() === i);
                return {
                    label: label.slice(0, 3),
                    income: monthTxs.filter(tx => tx.type === "income").reduce((s, tx) => s + tx.amount, 0),
                    expense: monthTxs.filter(tx => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0),
                };
            });
            setAnnualData(points);
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

    const totalCatExpenses = categoryStats.reduce((s, c) => s + c.total, 0);
    const pieData = categoryStats.slice(0, 6).map(c => ({
        name: c.name,
        value: c.total,
        color: c.color,
        pct: totalCatExpenses > 0 ? Math.round((c.total / totalCatExpenses) * 100) : 0,
    }));

    return (
        <div className="min-h-screen bg-[var(--color-bg)] p-6">
            <div className="w-fulll mx-auto space-y-6">

                {/* Month nav */}
                <div className="flex items-center gap-3">
                    <button onClick={prevMonth} className="p-2 rounded-xl bg-white shadow-[var(--box-shadow)] hover:bg-gray-50 transition-all cursor-pointer">
                        <ChevronLeft size={18} className="text-gray-500" />
                    </button>
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-xl shadow-[var(--box-shadow)] w-60">
                        <Calendar size={16} className="text-[var(--color-primary)]" />
                        <span className="font-semibold text-[var(--color-text)]">
                            {POLISH_MONTHS[month].toLowerCase()} {year}
                        </span>
                    </div>
                    <button onClick={nextMonth} className="p-2 rounded-xl bg-white shadow-[var(--box-shadow)] hover:bg-gray-50 transition-all cursor-pointer">
                        <ChevronRight size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Top section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Summary cards */}
                    <div className="space-y-4">
                        <SummaryCard
                            icon={<Database size={20} className="text-[var(--color-primary)]" />}
                            iconBg="bg-gray-100"
                            label="Saldo rachunków i portfeli"
                            value={`${fmt(totalBalance)} PLN`}
                            valueColor="text-[var(--color-text)]"
                            loading={loading}
                        />
                        <SummaryCard
                            icon={<TrendingUp size={20} className="text-emerald-600" />}
                            iconBg="bg-emerald-50"
                            label="Przychody"
                            value={`${fmt(stats?.income ?? 0)} PLN`}
                            valueColor="text-emerald-600"
                            loading={loading}
                        />
                        <SummaryCard
                            icon={<TrendingDown size={20} className="text-red-500" />}
                            iconBg="bg-red-50"
                            label="Wydatki"
                            value={`${fmt(stats?.expense ?? 0)} PLN`}
                            valueColor="text-red-500"
                            loading={loading}
                        />
                    </div>

                    {/* Wallets table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-[var(--box-shadow)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-[var(--color-text)] text-base">Rachunki i portfele gotówkowe</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-5 py-3 text-left text-xs text-gray-400 uppercase tracking-wider font-medium">Nazwa portfela gotówkowego</th>
                                    <th className="px-5 py-3 text-right text-xs text-gray-400 uppercase tracking-wider font-medium">Kwota gotówki</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={2} className="px-5 py-6 text-center text-gray-400 text-sm">Ładowanie...</td></tr>
                                ) : wallets.length === 0 ? (
                                    <tr><td colSpan={2} className="px-5 py-6 text-center text-gray-400 text-sm">Brak portfeli</td></tr>
                                ) : (
                                    wallets.map((w, i) => (
                                        <tr key={w._id} className={i < wallets.length - 1 ? "border-b border-gray-50" : ""}>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: w.color }} />
                                                    <span className="font-medium text-[var(--color-text)]">{w.name}</span>
                                                </div>
                                            </td>
                                            <td className={`px-5 py-3.5 text-right font-semibold ${w.balance >= 0 ? "text-[var(--color-text)]" : "text-red-500"}`}>
                                                {fmt(w.balance)} <span className="text-gray-400 font-normal text-xs">{w.currency}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {!loading && wallets.length > 0 && (
                            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                                <a href="/wallets" className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-all">
                                    Zobacz wszystkie <ArrowRight size={14} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Annual chart */}
                <div className="bg-white rounded-2xl shadow-[var(--box-shadow)] p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold text-[var(--color-text)] text-base">Zestawienie roczne {year}</h2>
                        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                            {(["bar", "line"] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setChartType(t)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                        chartType === t
                                            ? "bg-white text-[var(--color-primary)] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    {CHART_TYPE_LABELS[t]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        {chartType === "bar" ? (
                            <BarChart data={annualData} barSize={16} barGap={2}>
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${fmt(Number(value ?? 0))} PLN`,
                                        name === "expense" ? "Wydatki" : "Przychody"
                                    ]}
                                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                                />
                                <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : (
                            <LineChart data={annualData}>
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${fmt(Number(value ?? 0))} PLN`,
                                        name === "expense" ? "Wydatki" : "Przychody"
                                    ]}
                                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                                />
                                <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2} dot={false} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Category donut */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-[var(--box-shadow)] p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-semibold text-[var(--color-text)] text-base">Wydatki w grupach kategorii</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Ładowanie...</div>
                        ) : pieData.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Brak wydatków w tym miesiącu</div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <ResponsiveContainer width={180} height={180}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                            strokeWidth={0}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color || "#9ca3af"} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="flex-1 space-y-3">
                                    {pieData.map((entry, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color || "#9ca3af" }} />
                                                <span className="text-sm text-gray-600 truncate">{entry.name}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-[var(--color-text)] ml-2 flex-shrink-0">{entry.pct}%</span>
                                        </div>
                                    ))}
                                    {!loading && categoryStats.length > 0 && (
                                        <a href="/transactions" className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-all pt-1">
                                            Zobacz wszystkie <ArrowRight size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function SummaryCard({
    icon, iconBg, label, value, valueColor, loading,
}: {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: string;
    valueColor: string;
    loading: boolean;
}) {
    return (
        <div className="bg-white rounded-2xl shadow-[var(--box-shadow)] p-5">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            {loading ? (
                <div className="h-7 w-32 bg-gray-100 rounded animate-pulse" />
            ) : (
                <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            )}
        </div>
    );
}
