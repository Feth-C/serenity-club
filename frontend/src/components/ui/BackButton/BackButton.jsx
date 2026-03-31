// frontend/src/components/ui/BackButton.jsx

import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";

const BackButton = ({ label = "Indietro" }) => {
  const navigate = useNavigate();

  return (
    <Button variant="secondary" onClick={() => navigate(-1)}>
      ← {label}
    </Button>
  );
};

export default BackButton;