// components/ui/form/form.jsx

import React from "react";
import FormInput from "./form-input";
import FormSelect from "./form-select";
import "./form.css";

const MoneyInput = ({ currency, amount, onCurrencyChange, onAmountChange, currencies = ["EUR", "CHF"] }) => {
    return (
        <div className="form-money">
            <FormSelect
                name="currency"
                value={currency}
                onChange={onCurrencyChange}
                options={currencies.map(c => ({ value: c, label: c }))}
            />
            <FormInput
                type="number"
                name="amount"
                step="0.01"
                min="0"
                value={amount}
                onChange={onAmountChange}
                placeholder="0.00 "
                required
            />
        </div>
    );
};

export default MoneyInput;