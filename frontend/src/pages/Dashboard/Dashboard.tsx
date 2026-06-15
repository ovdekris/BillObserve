import { useEffect, useState, useCallback } from "react";
import AddTransactionModal from "./Transaction/AddTransactionModal.tsx";
import EditTransactionModal from "./Transaction/EditTransactionModal.tsx";
import { CategoryList, type Category } from "./Category/CategoryList.tsx";
import { TransactionList, type Transaction } from "./Transaction/TransactionList.tsx";
import { apiFetch } from "../../utils/apiFetch.ts";

function Dashboard() {
    const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
    const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [catLoading, setCatLoading] = useState(true);
    const [catError, setCatError] = useState("");

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [txLoading, setTxLoading] = useState(true);
    const [txError, setTxError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

    const fetchCategories = useCallback(() => {
        setCatLoading(true);
        const load = (type: "expense" | "income") =>
            apiFetch(`/categories/type/${type}`)
                .then(r => r.json())
                .then(j => j.data as Category[]);

        Promise.all([load("expense"), load("income")])
            .then(([exp, inc]) => {
                setExpenseCategories(exp);
                setIncomeCategories(inc);
                setCatError("");
            })
            .catch(() => setCatError("Nie udało się pobrać kategorii"))
            .finally(() => setCatLoading(false));
    }, []);

    const fetchTransactions = useCallback(() => {
        setTxLoading(true);
        apiFetch("/transactions?limit=100")
            .then(r => r.json())
            .then(j => {
                setTransactions(j.data as Transaction[]);
                setTxError("");
            })
            .catch(() => setTxError("Nie udało się pobrać transakcji"))
            .finally(() => setTxLoading(false));
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        const res = await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Nie udało się usunąć transakcji');
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        fetchCategories();
        fetchTransactions();
    }, [fetchCategories, fetchTransactions]);

    const toggle = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const rawTotals = transactions.reduce<Record<string, number>>((acc, tx) => {
        if (tx.category && (tx.type === "expense" || tx.type === "income")) {
            acc[tx.category._id] = (acc[tx.category._id] ?? 0) + tx.amount;
        }
        return acc;
    }, {});

    const categoryTotals = { ...rawTotals };
    [...expenseCategories, ...incomeCategories].forEach(cat => {
        cat.subcategories.forEach(sub => {
            if (rawTotals[sub._id]) {
                categoryTotals[cat._id] = (categoryTotals[cat._id] ?? 0) + rawTotals[sub._id];
            }
        });
    });

    return (
        <>
            {showModal && (
                <AddTransactionModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchTransactions();
                    }}
                />
            )}

            {editTransaction && (
                <EditTransactionModal
                    transaction={editTransaction}
                    onClose={() => setEditTransaction(null)}
                    onSuccess={() => {
                        setEditTransaction(null);
                        fetchTransactions();
                    }}
                />
            )}

            <div className="min-h-screen bg-[var(--color-bg)] p-6">
                <div className="max-w-full mx-auto flex gap-6 items-start">
                    <CategoryList
                        expenseCategories={expenseCategories}
                        incomeCategories={incomeCategories}
                        categoryTotals={categoryTotals}
                        expandedIds={expandedIds}
                        onToggle={toggle}
                        loading={catLoading}
                        error={catError}
                    />
                    <TransactionList
                        transactions={transactions}
                        loading={txLoading}
                        error={txError}
                        onAddClick={() => setShowModal(true)}
                        onDelete={handleDelete}
                        onEditClick={setEditTransaction}
                    />
                </div>
            </div>
        </>
    );
}

export default Dashboard;
