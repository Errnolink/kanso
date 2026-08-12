// Table — data table. Lineage: btop's process list × NERV manifest sheets.
// Dim uppercase head, hairline separators, 1.5% zebra, orange wash on the
// selected row. Generic over the row type, so it is a plain function
// component rather than a forwardRef (a generic ref forward would erase T).
import { type HTMLAttributes, type ReactNode } from "react";
import { MARK } from "../../glyphs";

export type TableAlign = "left" | "center" | "right";

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  align?: TableAlign;
  width?: string | number;
  render?: (row: T) => ReactNode;
}

export interface TableSort {
  key: string;
  direction: "asc" | "desc";
}

export interface TableProps<T> extends Omit<HTMLAttributes<HTMLTableElement>, "onSelect"> {
  columns: readonly TableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  selectedKey?: string;
  onSelect?: (row: T) => void;
  sort?: TableSort;
  onSortChange?: (key: string) => void;
  dense?: boolean;
  caption?: string;
}

const alignClass: Record<TableAlign, string> = {
  left: "kanso-table__cell--left",
  center: "kanso-table__cell--center",
  right: "kanso-table__cell--right",
};

function defaultCell<T>(row: T, key: string): ReactNode {
  const raw = (row as Record<string, unknown>)[key];
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "number" || typeof raw === "string" || typeof raw === "boolean") {
    return String(raw);
  }
  return "";
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  selectedKey,
  onSelect,
  sort,
  onSortChange,
  dense = false,
  caption,
  className = "",
  "aria-label": ariaLabel,
  ...rest
}: TableProps<T>) {
  // Held as consts so the narrowing survives into the row/head callbacks.
  const select = onSelect;
  const sortBy = onSortChange;

  // `aria-selected` is only legal inside a grid, so a selectable table takes
  // the grid roles wholesale; a static one stays a plain table and says
  // nothing about selection.
  const grid = select !== undefined;

  return (
    <div className="kanso-table__scroll">
      <table
        className={[
          "kanso-table",
          dense ? "kanso-table--dense" : "",
          select ? "kanso-table--selectable" : "",
          className,
        ].join(" ")}
        role={grid ? "grid" : undefined}
        aria-label={ariaLabel ?? caption ?? "data table"}
        {...rest}
      >
        {caption !== undefined && <caption className="kanso-sr-only">{caption}</caption>}
        <thead>
          <tr role={grid ? "row" : undefined}>
            {columns.map((col) => {
              const active = sort && sort.key === col.key ? sort : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  role={grid ? "columnheader" : undefined}
                  style={col.width === undefined ? undefined : { width: col.width }}
                  aria-sort={
                    active
                      ? active.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={[
                    "kanso-table__th",
                    alignClass[col.align ?? "left"],
                    sortBy ? "kanso-table__th--sortable" : "",
                    active ? "kanso-table__th--active" : "",
                  ].join(" ")}
                >
                  {sortBy ? (
                    <button
                      type="button"
                      className="kanso-table__sortbtn"
                      onClick={() => sortBy(col.key)}
                    >
                      {col.header}
                      <span className="kanso-table__sortmark" aria-hidden="true">
                        {active ? (active.direction === "asc" ? MARK.up : MARK.down) : ""}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            const selected = selectedKey !== undefined && selectedKey === key;
            return (
              <tr
                key={key}
                className={[
                  "kanso-table__row",
                  selected ? "kanso-table__row--selected" : "",
                ].join(" ")}
                role={grid ? "row" : undefined}
                aria-selected={grid ? selected : undefined}
                tabIndex={select ? 0 : undefined}
                onClick={select ? () => select(row) : undefined}
                onKeyDown={
                  select
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          select(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    role={grid ? "gridcell" : undefined}
                    className={[
                      "kanso-table__cell",
                      alignClass[col.align ?? "left"],
                    ].join(" ")}
                  >
                    {col.render ? col.render(row) : defaultCell(row, col.key)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
