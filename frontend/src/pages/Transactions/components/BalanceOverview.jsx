// frontend/src/pages/transactions/components/BalanceOverview.jsx

import { useMemo } from "react";
import Card from "../../../components/ui/Card/Card";
import TransactionsDonut from "./TransactionsDonut"; // opcional, gráfico de pizza
import "./BalanceOverview.css";

export default function BalanceOverview({ transactions = [], currencies = [] }) {

    // Símbolos das moedas
    const getCurrencySymbol = (currency) => {
        const symbols = { EUR: "€", USD: "$", CHF: "CHF", GBP: "£" };
        return symbols[currency] || currency;
    };

    // Agrupamento por moeda considerando apenas transações filtradas
    const grouped = useMemo(() => {
        const map = {};
        transactions.forEach(t => {
            if (!map[t.currency]) map[t.currency] = { income: 0, expense: 0 };
            if (t.type === "income") map[t.currency].income += Number(t.amount);
            else map[t.currency].expense += Number(t.amount);
        });
        return map;
    }, [transactions]);

    // Formata valores de acordo com moeda e região
    const formatCurrency = (value, currency) => {
        const locale = currency === "CHF" ? "de-CH" : "it-IT";

        // Mantemos sinal positivo/negativo separadamente
        const sign = value < 0 ? "-" : "";
        const formatted = new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            minimumFractionDigits: 2
        }).format(Math.abs(value));

        return `${sign}${formatted}`;
    };

    if (!currencies.length) return null;

    return (
        <Card title="💰 Riepilogo per valuta">
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
                                <strong>💲Saldo</strong>
                                <span>
                                    {formatCurrency(balance, currency)}
                                </span>
                            </div>

                            {/* Opcional: gráfico donut */}
                            {transactions.length > 0 && (
                                <div className="donut-container">
                                    <TransactionsDonut
                                        transactions={transactions.filter(t => t.currency === currency)}
                                        currency={currency}
                                    />
                                </div>
                            )}

                        </div>
                    );
                })}

            </div>
        </Card>
    );
}