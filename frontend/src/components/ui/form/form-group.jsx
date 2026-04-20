// components/ui/form/form-group.jsx

import "./form.css";

const FormGroup = ({ children, inline = false, className = "" }) => {
    return (
        <div className={`form-group ${inline ? "form-group--inline" : ""} ${className}`}>
            {children}
        </div>
    );
};

export default FormGroup;