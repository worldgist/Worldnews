/** Compact page list with ellipses when there are many pages. */
export function getPaginationItems(currentPage, totalPages) {
  if (totalPages < 1) return []
  if (totalPages <= 1) return [{ type: 'page', value: 1 }]

  const pages = new Set([1, totalPages])
  for (let p = currentPage - 2; p <= currentPage + 2; p += 1) {
    if (p >= 1 && p <= totalPages) pages.add(p)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) {
      out.push({ type: 'ellipsis', key: `${prev}-${p}` })
    }
    out.push({ type: 'page', value: p })
    prev = p
  }
  return out
}

export const STORIES_PER_PAGE = 10

/**
 * Shared pagination bar (styles: .home-pagination in App.css).
 * Renders nothing when totalPages <= 1.
 */
export default function PostPagination({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel = 'Stories pagination',
}) {
  if (totalPages <= 1) return null

  const paginationItems = getPaginationItems(currentPage, totalPages)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const goNext = () => {
    if (!hasNextPage) return
    onPageChange(currentPage + 1)
  }

  const goPrevious = () => {
    if (!hasPreviousPage) return
    onPageChange(currentPage - 1)
  }

  return (
    <nav className="home-pagination" aria-label={ariaLabel}>
      <div className="home-pagination__inner">
        <button
          type="button"
          className="home-pagination__step home-pagination__step--prev"
          onClick={goPrevious}
          disabled={!hasPreviousPage}
          aria-label="Go to previous page"
        >
          <span className="home-pagination__chev" aria-hidden="true">
            ‹
          </span>
          <span className="home-pagination__step-label">Previous</span>
        </button>

        <ol className="home-pagination__pages" role="list">
          {paginationItems.map((item) =>
            item.type === 'ellipsis' ? (
              <li
                key={item.key}
                className="home-pagination__ellipsis"
                aria-hidden="true"
              >
                <span>…</span>
              </li>
            ) : (
              <li key={item.value}>
                <button
                  type="button"
                  className={
                    item.value === currentPage
                      ? 'home-pagination__page is-active'
                      : 'home-pagination__page'
                  }
                  onClick={() => onPageChange(item.value)}
                  aria-label={`Page ${item.value}`}
                  aria-current={item.value === currentPage ? 'page' : undefined}
                >
                  {item.value}
                </button>
              </li>
            )
          )}
        </ol>

        <button
          type="button"
          className="home-pagination__step home-pagination__step--next"
          onClick={goNext}
          disabled={!hasNextPage}
          aria-label="Go to next page"
        >
          <span className="home-pagination__step-label">Next</span>
          <span className="home-pagination__chev" aria-hidden="true">
            ›
          </span>
        </button>
      </div>
      <p className="home-pagination__status">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </p>
    </nav>
  )
}
