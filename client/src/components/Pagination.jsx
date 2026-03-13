export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    // Build sorted set of page numbers to show, filling gaps >= 2 with '...'
    const pageSet = new Set([1, totalPages]);
    for (let p = page - 2; p <= page + 2; p++) {
        if (p >= 1 && p <= totalPages) pageSet.add(p);
    }
    const sorted = Array.from(pageSet).sort((a, b) => a - b);

    const pages = [];
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] === 2) {
            // gap of exactly 1 missing number — show it directly
            pages.push(sorted[i] - 1);
        } else if (i > 0 && sorted[i] - sorted[i - 1] > 2) {
            pages.push('...');
        }
        pages.push(sorted[i]);
    }

    const btnStyle = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 6px',
        fontSize: '14px',
        color: 'inherit',
    };

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginTop: '32px' }}>
            {page > 1 && (
                <button style={btnStyle} onClick={() => onPageChange(page - 1)}>prev</button>
            )}
            {pages.map((p, i) =>
                p === '...'
                    ? <span key={`ellipsis-${i}`}>...</span>
                    : (
                        <button
                            key={p}
                            style={{ ...btnStyle, fontWeight: p === page ? 'bold' : 'normal' }}
                            aria-current={p === page ? 'page' : undefined}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    )
            )}
            {page < totalPages && (
                <button style={btnStyle} onClick={() => onPageChange(page + 1)}>next</button>
            )}
        </div>
    );
}
