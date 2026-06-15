import {Car, Gamepad2, ShoppingBag, FileText,
    HeartPulse,
    BookOpen,
    Home,
    Shirt,
    MoreHorizontal,
    Briefcase,
    Gift,
    ChevronDown,
    Layers
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

export interface Subcategory {
    _id: string;
    name: string;
    color: string;
    order: number;
}

export interface Category {
    _id: string;
    name: string;
    color: string;
    icon: string;
    order: number;
    subcategories: Subcategory[];
}

interface Props {
    expenseCategories: Category[];
    incomeCategories: Category[];
    categoryTotals: Record<string, number>;
    expandedIds: Set<string>;
    onToggle: (id: string) => void;
    loading: boolean;
    error: string;
}

function CategoryRow({
    cat,
    total,
    expanded,
    onToggle,
    isLast,
    categoryTotals,
}: {
    cat: Category;
    total?: number;
    expanded: boolean;
    onToggle: () => void;
    isLast: boolean;
    categoryTotals: Record<string, number>;
}) {
    const Icon = ICON_MAP[cat.name];
    console.log("icon key:", cat.name);
    const formattedTotal = total != null
        ? new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total) + " PLN"
        : null;

    return (
        <div className={!isLast ? "border-b border-gray-50" : ""}>
            <button onClick={onToggle} aria-expanded={expanded} className={`cursor-pointer w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 hover:border-gray-200 transition-all border-b ${
                expanded ? 'border-gray-200' : 'border-transparent'}`}>
                <span className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "33" }}>
                        {Icon ? (
                            <Icon size={15} style={{ color: cat.color }} />
                        ) : (
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}/>
                        )}
                    </span>
                    <span className="font-medium text-[var(--color-text)] text-base truncate">{cat.name}</span>
                </span>
                <span className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {formattedTotal && (
                        <span className="text-base font-semibold text-[var(--color-text)]">
                            {formattedTotal}
                </span>
        )}

                    {cat.subcategories.length > 0 && (
                        <ChevronDown size={15} className={`text-gray-400 transition-transform duration-200 ${
                                expanded ? "rotate-180" : ""
                            }`}
                        />
                    )}
    </span>
            </button>


            {expanded && cat.subcategories.length > 0 && (
                <div>
                    {cat.subcategories
                        .sort((a, b) => a.order - b.order)
                        .map((sub) => {
                            const subTotal = categoryTotals[sub._id];
                            const formattedSubTotal = subTotal != null
                                ? new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(subTotal) + " PLN"
                                : null;
                            return (
                                <div key={sub._id} className="flex items-center justify-between pl-16 pr-5 py-2 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <span className="flex items-center gap-2.5 text-base text-gray-500">
                                        {sub.name}
                                    </span>
                                    {formattedSubTotal && (
                                        <span className="text-sm font-medium text-gray-500">{formattedSubTotal}</span>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}

export function CategoryList({ expenseCategories, incomeCategories, categoryTotals, expandedIds, onToggle, loading, error }: Props) {
    const allCategories = [...expenseCategories, ...incomeCategories];

    const totalAll = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);
    const formattedTotalAll = new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalAll) + " PLN";

    return (
        <div className="w-[30%] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-[var(--box-shadow)] overflow-hidden border border-[var(--color-border-gray)]">
                <div className="px-5 py-4 border-b border-gray-100 bg-[var(--color-dark)]">
                    <h2 className="font-semibold text-[var(--color-text)] text-2xl text-white">Kategorie</h2>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <i className="inline-flex">
                        <svg className="animate-spin h-5 w-5 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        </i>
                    </div>
                )}

                {error && (
                    <p className="px-5 py-4 text-sm text-red-500">{error}</p>
                )}

                {!loading && !error && (
                    <>
                        {expenseCategories.length > 0 && (
                                <span className="inline-block font-semibold uppercase tracking-wider text-gray-400 text-sm px-5 pt-3 pb-1">Wydatki</span>
                        )}

                        {expenseCategories.length > 0 && (
                            <div className="border-b border-gray-50 w-full flex items-center justify-between px-5 py-3 cursor-pointer">
                                <span className="flex items-center gap-3 min-w-0">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--color-primary)]" style={{ opacity: 0.85 }}>
                                        <Layers size={15} className="text-white" />
                                    </span>
                                    <span className="font-medium text-[var(--color-text)] text-base truncate">Wszystko</span>
                                </span>
                                <span className="text-base font-semibold text-[var(--color-text)] flex-shrink-0 ml-2">{formattedTotalAll}</span>
                            </div>
                        )}

                        {expenseCategories.map((cat, index) => (
                            <CategoryRow
                                key={cat._id}
                                cat={cat}
                                total={categoryTotals[cat._id]}
                                expanded={expandedIds.has(cat._id)}
                                onToggle={() => onToggle(cat._id)}
                                isLast={index === expenseCategories.length - 1}
                                categoryTotals={categoryTotals}
                            />
                        ))}

                        {allCategories.length === 0 && (
                            <p className="px-5 py-8 text-sm text-gray-400 text-center">Brak kategorii</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
