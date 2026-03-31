// frontend/src/components/ui/Button/Button.jsx

import "./button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  iconLeft,
  iconRight,
  className = "",
}) => {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {iconLeft && <span className="btn__icon btn__icon--left">{iconLeft}</span>}
      <span className="btn__text">{children}</span>
      {iconRight && <span className="btn__icon btn__icon--right">{iconRight}</span>}
    </button>
  );
};

export default Button;
