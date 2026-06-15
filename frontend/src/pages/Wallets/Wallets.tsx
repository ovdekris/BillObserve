import { useEffect, useState } from "react";
import { Banknote, Building2, CreditCard, PiggyBank, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import AddWalletModal from "./AddWalletModal.tsx";
import { apiFetch } from "../../utils/apiFetch.ts";

const TYPE_META: Record<string, { label: string; Icon: LucideIcon; bg: string; color: string }> = {
    cash:        { label: "Gotówka",         Icon: Banknote,   bg: "#e6eef8", color: "#5b8ab8" },
    bank:        { label: "Konto bankowe",   Icon: Building2,  bg: "#e6f0fc", color: "#4080c0" },
    credit_card: { label: "Karta kredytowa", Icon: CreditCard, bg: "#fff0e6", color: "#e07a30" },
    savings:     { label: "Oszczędności",    Icon: PiggyBank,  bg: "#e8f5e9", color: "#4caf50" },
    investment:  { label: "Inwestycje",      Icon: TrendingUp, bg: "#f3e8ff", color: "#9c27b0" },
    other:       { label: "Inne",            Icon: Wallet,     bg: "#f0eef8", color: "#7c3aed" },
};

interface WalletData {
    _id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    color: string;
    includeInTotal: boolean;
}

function Wallets() {
    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchWallets = () => {
        setLoading(true);
        apiFetch(`/wallets`)
            .then(r => r.json())
            .then(j => setWallets(j.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchWallets(); }, []);

    const included = wallets.filter(w => w.includeInTotal);
    const totalBalance = included.reduce((sum, w) => sum + w.balance, 0);

    const fmt = (amount: number, currency: string) =>
        new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + " " + currency;

    return (
        <>
            {showModal && (
                <AddWalletModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchWallets(); }}
                />
            )}

            <div className="min-h-screen bg-[#f0eef8] px-12 py-8">
                <div className="bg-white rounded-[16px] px-8 py-7 max-w-[760px] mx-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-[22px] font-semibold text-[#1a1040]">Portfele</h1>
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-9 h-9 bg-[#7c3aed] hover:bg-[#6d31d4] text-white rounded-[10px] flex items-center justify-center text-[22px] leading-none transition-colors cursor-pointer"
                        >
                            +
                        </button>
                    </div>

                    {/* Total balance */}
                    {!loading && wallets.length > 0 && (
                        <>
                            <div className="mb-7">
                                <p className="text-[13px] text-[#888] mb-1">Łączne saldo</p>
                                <p className="text-[36px] font-bold text-[#1a1040] leading-none">{fmt(totalBalance, "PLN")}</p>
                                <p className="text-[13px] text-[#999] mt-1">
                                    {included.length} z {wallets.length} portfeli
                                </p>
                            </div>
                            <hr className="border-none border-t border-[#f0eef8] h-px bg-[#f0eef8] mb-1" />
                        </>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <svg className="animate-spin h-6 w-6 text-[#7c3aed]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    ) : wallets.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="w-14 h-14 bg-[#f0eef8] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wallet size={26} color="#7c3aed" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#1a1040] mb-1">Brak portfeli</h3>
                            <p className="text-[13px] text-[#999] mb-5">Utwórz pierwszy portfel, żeby zacząć śledzić finanse</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-5 py-2.5 bg-[#7c3aed] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#6d31d4] transition-colors cursor-pointer"
                            >
                                Utwórz portfel
                            </button>
                        </div>
                    ) : (
                        wallets.map((wallet, index) => {
                            const meta = TYPE_META[wallet.type] ?? TYPE_META.other;
                            const Icon = meta.Icon;
                            const isLast = index === wallets.length - 1;

                            return (
                                <div key={wallet._id}>
                                    <div className="flex items-center py-4">
                                        <div
                                            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                                            style={{ backgroundColor: wallet.color ? wallet.color + "22" : meta.bg }}
                                        >
                                            <Icon size={22} style={{ color: wallet.color || meta.color }} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[15px] font-semibold text-[#1a1040]">{wallet.name}</p>
                                            <p className="text-[13px] text-[#999] mt-0.5">{meta.label}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[16px] font-semibold ${wallet.balance < 0 ? "text-red-500" : "text-[#1a1040]"}`}>
                                                {fmt(wallet.balance, wallet.currency)}
                                            </p>
                                            {!wallet.includeInTotal && (
                                                <p className="text-[12px] text-[#bbb]">poza sumą</p>
                                            )}
                                        </div>
                                    </div>
                                    {!isLast && <hr className="border-none h-px bg-[#f0eef8]" />}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}

export default Wallets;
