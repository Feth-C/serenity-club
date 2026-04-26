// frontend/src/pages/transactions/components/BalanceOverview.jsx

import { useMemo } from "react";
import Card from "../../../components/ui/Card/Card";
import TransactionsDonut from "./TransactionsDonut";
import "./BalanceOverview.css";

const getCurrencySymbol = (currency) => {
    const symbols = { EUR: "€", USD: "$", CHF: "CHF", GBP: "£" };
    return symbols[currency] || currency;
};

export default function BalanceOverview({ globalStats, transactions = [] }) {
    // 1. Organiza os dados (Prioriza Global > Local)
    const grouped = useMemo(() => {
        if (globalStats && Array.isArray(globalStats)) {
            const map = {};
            globalStats.forEach(s => {
                map[s.currency] = { income: s.total_income, expense: s.total_expense };
            });
            return map;
        }

        const map = {};
        transactions.forEach(t => {
            if (!map[t.currency]) map[t.currency] = { income: 0, expense: 0 };
            if (t.type === "income") map[t.currency].income += Number(t.amount);
            else map[t.currency].expense += Number(t.amount);
        });
        return map;
    }, [globalStats, transactions]);

    const currencies = Object.keys(grouped);
    if (!currencies.length) return null;

    const formatCurrency = (value, currency) => {
        const locale = currency === "CHF" ? "de-CH" : "it-IT";
        const sign = value < 0 ? "-" : "";
        const formatted = new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            minimumFractionDigits: 2
        }).format(Math.abs(value));
        return `${sign}${formatted}`;
    };

    return (
        <Card title="💰 Riepilogo Finanziario">
            <div className="balance-grid">
                {currencies.map(currency => {
                    const income = grouped[currency]?.income || 0;
                    const expense = grouped[currency]?.expense || 0;
                    const balance = income - expense;
                    const symbol = getCurrencySymbol(currency);

                    return (
                        <div key={currency} className="balance-card">
                            <div className="balance-header">
                                <span className="currency-code">{currency}</span>
                                <span className="currency-symbol">{symbol}</span>
                            </div>

                            <div className="balance-body">
                                <div className="balance-row">
                                    <span>🟢 Entrate</span>
                                    <span className="balance-income">
                                        +{formatCurrency(income, currency)}
                                    </span>
                                </div>

                                <div className="balance-row">
                                    <span>🔴 Uscite</span>
                                    <span className="balance-expense">
                                        -{formatCurrency(expense, currency)}
                                    </span>
                                </div>

                                <div className="balance-row balance-total">
                                    <strong>💲 Saldo</strong>
                                    <span className={balance >= 0 ? "pos" : "neg"}>
                                        {formatCurrency(balance, currency)}
                                    </span>
                                </div>
                            </div>

                            {/* GRÁFICO DONUT (Agora com dados globais) */}
                            <div className="donut-container">
                                <TransactionsDonut
                                    stats={globalStats?.find(s => s.currency === currency) || {
                                        total_income: income,
                                        total_expense: expense
                                    }}
                                    currency={currency}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}