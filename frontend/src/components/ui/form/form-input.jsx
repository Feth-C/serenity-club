// components/ui/form/form-input.jsx

import React from "react";

const FormInput = ({ as, rows, className = "", ...props }) => {

    if (as === "textarea") {
        return (
            <textarea
                {...props}
                rows={rows || 3}
                className={`form-input form-textarea ${className}`}
            />
        );
    }

    return (
        <input
            {...props}
            className={`form-input form-textarea ${className}`}
        />
    );
};

export default FormInput;