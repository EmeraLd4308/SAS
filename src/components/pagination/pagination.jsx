import './pagination.scss';

export function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {
    const paginate = (pageNumber) => onPageChange(pageNumber);

    return (
        <div className="pagination">
            <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
            >
                ← Попередня
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => {
                    const showEllipsis = index < array.length - 1 && array[index + 1] - page > 1;
                    return (
                        <span key={page}>
                            <button
                                onClick={() => paginate(page)}
                                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                            {showEllipsis && <span className="pagination-ellipsis">...</span>}
                        </span>
                    );
                })}

            <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
            >
                Наступна →
            </button>
        </div>
    );
}