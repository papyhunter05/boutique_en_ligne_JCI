import styles from './DataTable.module.css'

// columns : [{ key, header, render: (row) => ..., align?: 'right' | 'center', mobile?: 'title' | 'actions' }]
// maxHeight : facultatif. Sans lui, le tableau prend sa hauteur naturelle et c'est la page qui défile.
export default function DataTable({ columns, rows, rowKey, caption, maxHeight, rowTone }) {
  return (
    <div className={styles.root}>
      <div
        className={styles.wrapper}
        style={maxHeight ? { '--table-max-height': maxHeight } : undefined}
        role="region"
        aria-label={caption}
        tabIndex={0}
      >
        <table className={styles.table} role="table">
          <caption className="sr-only">{caption}</caption>
          <thead role="rowgroup">
            <tr role="row">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  role="columnheader"
                  className={styles[column.align]}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
              {rows.map((row) => (
                <tr key={rowKey(row)} role="row" data-tone={rowTone?.(row)}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    role="cell"
                    data-label={column.header}
                    data-mobile={column.mobile}
                    className={styles[column.align]}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}