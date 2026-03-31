// components/ui/form/form-select.jsx

import React from "react";

const FormSelect = ({
    id,
    name,
    value,
    onChange,
    options = [],
    required = false,
    disabled = false
}) => {
    return (
        <select
            id={id}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="form-select"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default FormSelect;