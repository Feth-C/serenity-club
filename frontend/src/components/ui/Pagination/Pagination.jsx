// frontend/src/components/ui/Pagination/Pagination.jsx

import Button from "../Button/Button";
import "./pagination.css";

const Pagination = ({
  page,
  totalPages,
  totalItems,
  onPrev,
  onNext
}) => {
  return (
    <div className="pagination">
      <Button
        variant="secondary"
        size="sm"
        onClick={onPrev}
        disabled={page <= 1}
      >
        Precedente
      </Button>

      <span className="pagination__info">
        Pagina {page} di {totalPages}
        {typeof totalItems === "number" && (
          <> · {totalItems} risultati</>
        )}
      </span>

      <Button
        variant="secondary"
        size="sm"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Successiva
      </Button>
    </div>
  );
};

export default Pagination;