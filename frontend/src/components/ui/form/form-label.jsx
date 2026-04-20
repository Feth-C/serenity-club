// components/ui/form/form-label.jsx

import "./form.css";

const FormLabel = ({ htmlFor, children }) => {
    return (
        <label className="form-label" htmlFor={htmlFor}>
            {children}
        </label>
    );
};

export default FormLabel;