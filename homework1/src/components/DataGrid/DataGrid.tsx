
import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { KeyboardEvent } from 'react';
import type { DataGridProps } from '../../types/data-grid-contract';

type SortDirection = 'asc' | 'desc';
type RowId = string | number;

interface ActiveCell {
  rowId: RowId | null;
  columnIndex: number;
}

export function DataGrid<T extends object>({
  data,
  columns,
  getRowId,
  onRowSelect,
  ariaLabel,
}: DataGridProps<T>) {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================

  const [sortKey, setSortKey] = useState<keyof T | null>(null);

  const [sortDirection, setSortDirection] =
    useState<SortDirection>('asc');

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<RowId>>(
    () => new Set()
  );

  const [activeCell, setActiveCell] = useState<ActiveCell>({
    rowId: null,
    columnIndex: 0,
  });

  const gridRef = useRef<HTMLTableElement>(null);
  const pendingPageFocus = useRef(false);

  const searchId = useId();
  const departmentId = useId();
  const descriptionId = useId();
  const headerIdPrefix = useId();

  const pageSize = 5;

  // ==========================================
  // 2. SORTING HANDLER
  // ==========================================

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDirection((previous) =>
        previous === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }

    setCurrentPage(1);
  }

  // ==========================================
  // 3. DEPARTMENT OPTIONS
  // ==========================================

  const departments = useMemo(() => {
    const values = data.map((item) =>
      String(
        (item as T & { department?: string }).department ?? ''
      )
    );

    return [...new Set(values)]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [data]);

  // ==========================================
  // 4. FILTERING
  // ==========================================

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return data.filter((item) => {
      const record = item as T & {
        name?: string;
        email?: string;
        department?: string;
      };

      const name = String(record.name ?? '').toLowerCase();
      const email = String(record.email ?? '').toLowerCase();
      const department = String(record.department ?? '');

      const matchesSearch =
        name.includes(query) || email.includes(query);

      const matchesDepartment =
        departmentFilter === 'ALL' ||
        department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [data, searchQuery, departmentFilter]);

  // ==========================================
  // 5. SORTING
  // ==========================================

  const sortedData = useMemo(() => {
    if (sortKey === null) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];

      const comparison =
        typeof first === 'number' &&
        typeof second === 'number'
          ? first - second
          : String(first).localeCompare(
              String(second),
              undefined,
              {
                numeric: true,
                sensitivity: 'base',
              }
            );

      return sortDirection === 'asc'
        ? comparison
        : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // ==========================================
  // 6. PAGINATION
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;

    return sortedData.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [sortedData, safePage]);

  // ==========================================
  // 7. ROW SELECTION
  // ==========================================

  const pageIds = paginatedData.map(getRowId);

  const allPageSelected =
    pageIds.length > 0 &&
    pageIds.every((id) => selectedIds.has(id));

  function toggleRow(item: T) {
    const id = getRowId(item);
    const wasSelected = selectedIds.has(id);

    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

    if (!wasSelected) {
      onRowSelect?.(item);
    }
  }

  function selectRow(item: T) {
    if (!selectedIds.has(getRowId(item))) {
      toggleRow(item);
    }
  }

  function toggleAllPage() {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }

      return next;
    });
  }

  // ==========================================
  // 8. FOCUS MANAGEMENT
  // ==========================================

  const visibleRowIds = paginatedData.map(getRowId);

  const activeRowVisible =
    activeCell.rowId !== null &&
    visibleRowIds.includes(activeCell.rowId);

  const effectiveActiveCell: ActiveCell =
    activeCell.rowId === null || !activeRowVisible
      ? {
          rowId: null,
          columnIndex:
            activeCell.rowId === null
              ? activeCell.columnIndex
              : 0,
        }
      : activeCell;

  const activeRowIndex =
    effectiveActiveCell.rowId === null
      ? -1
      : visibleRowIds.indexOf(effectiveActiveCell.rowId);

  function isActiveCell(rowIndex: number, columnIndex: number) {
    return (
      activeRowIndex === rowIndex &&
      effectiveActiveCell.columnIndex === columnIndex
    );
  }

  function focusCell(rowIndex: number, columnIndex: number) {
    const target = gridRef.current?.querySelector<HTMLElement>(
      `[data-grid-nav="true"]` +
      `[data-nav-row="${rowIndex}"]` +
      `[data-nav-col="${columnIndex}"]`
    );

    if (!target) return;

    const item = paginatedData[rowIndex];

    setActiveCell({
      rowId: rowIndex === -1 ? null : getRowId(item),
      columnIndex,
    });

    target.focus();
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    pendingPageFocus.current = true;
    setCurrentPage(nextPage);
  }

  useLayoutEffect(() => {
    if (!pendingPageFocus.current) return;

    pendingPageFocus.current = false;

    const firstCell = gridRef.current?.querySelector<HTMLElement>(
      'tbody [data-grid-nav="true"]'
    );

    if (firstCell) {
      firstCell.focus();
    } else {
      gridRef.current?.querySelector<HTMLElement>(
        'thead [data-grid-nav="true"]'
      )?.focus();
    }
  }, [safePage]);

  // ==========================================
  // 9. KEYBOARD NAVIGATION
  // ==========================================

  function handleGridKeyDown(
    event: KeyboardEvent<HTMLTableElement>
  ) {
    const origin = event.target;

    if (!(origin instanceof HTMLElement)) return;

    const target = origin.closest<HTMLElement>(
      '[data-grid-nav="true"]'
    );

    if (!target || !event.currentTarget.contains(target)) {
      return;
    }

    const rowIndex = Number(target.dataset.navRow);
    const columnIndex = Number(target.dataset.navCol);

    if (
      !Number.isInteger(rowIndex) ||
      !Number.isInteger(columnIndex)
    ) {
      return;
    }

    const isHeader = rowIndex === -1;

    const isCheckbox =
      target instanceof HTMLInputElement &&
      target.type === 'checkbox';

    const isButton = target instanceof HTMLButtonElement;

    const item = isHeader
      ? null
      : paginatedData[rowIndex];

    // Activate header controls or select a row.
    if (event.key === 'Enter') {
      if (isHeader) {
        if (isButton || isCheckbox) {
          event.preventDefault();
          target.click();
        }
      } else if (item) {
        event.preventDefault();

        if (isCheckbox) {
          target.click();
        } else {
          selectRow(item);
        }
      }

      return;
    }

    // Space uses native behavior for buttons and checkboxes.
    if (event.key === ' ' || event.key === 'Spacebar') {
      if (!isCheckbox && !isButton && item) {
        event.preventDefault();
        toggleRow(item);
      }

      return;
    }

    let nextRow = rowIndex;
    let nextColumn = columnIndex;

    switch (event.key) {
      case 'ArrowUp':
        nextRow--;
        break;

      case 'ArrowDown':
        nextRow++;
        break;

      case 'ArrowLeft':
        nextColumn--;
        break;

      case 'ArrowRight':
        nextColumn++;
        break;

      case 'Home':
        nextColumn = 0;
        break;

      case 'End':
        nextColumn = columns.length;
        break;

      default:
        return;
    }

    event.preventDefault();

    nextRow = Math.max(
      -1,
      Math.min(nextRow, paginatedData.length - 1)
    );

    nextColumn = Math.max(
      0,
      Math.min(nextColumn, columns.length)
    );

    focusCell(nextRow, nextColumn);
  }

  // ==========================================
  // 10. RENDER
  // ==========================================

  return (
    <div className="data-grid">
      {/* Filtering controls */}
      <div className="grid-toolbar">
        <div className="filter-field">
          <label htmlFor={searchId}>
            Search employees
          </label>

          <input
            id={searchId}
            type="search"
            value={searchQuery}
            placeholder="Search by name or email..."
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-field">
          <label htmlFor={departmentId}>
            Department
          </label>

          <select
            id={departmentId}
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">
              All departments
            </option>

            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Keyboard navigation instructions */}
      <p id={descriptionId} className="grid-instructions">
        Use arrow keys to navigate the grid. Press Enter
        to activate sorting or select a row. Press Space
        to toggle selection. Use Tab to leave the grid.
      </p>

      {/* Accessible grid */}
      <div className="table-container">
        <table
          ref={gridRef}
          role="grid"
          aria-label={ariaLabel}
          aria-describedby={descriptionId}
          aria-multiselectable="true"
          onKeyDown={handleGridKeyDown}
        >
          <thead>
            <tr>
              {/* Select-all header */}
              <th scope="col">
                <input
                  type="checkbox"
                  aria-label="Select all employees on this page"
                  checked={allPageSelected}
                  onChange={toggleAllPage}
                  data-grid-nav="true"
                  data-nav-row={-1}
                  data-nav-col={0}
                  tabIndex={
                    isActiveCell(-1, 0) ? 0 : -1
                  }
                  onFocus={() =>
                    setActiveCell({
                      rowId: null,
                      columnIndex: 0,
                    })
                  }
                />
              </th>

              {/* Sortable and regular headers */}
              {columns.map((column, columnIndex) => {
                const isSorted =
                  sortKey === column.accessorKey;

                const headerId =
                  `${headerIdPrefix}-${columnIndex}`;

                return (
                  <th
                    key={String(column.accessorKey)}
                    id={headerId}
                    scope="col"
                    aria-sort={
                      isSorted
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="sort-button"
                        data-grid-nav="true"
                        data-nav-row={-1}
                        data-nav-col={columnIndex + 1}
                        tabIndex={
                          isActiveCell(
                            -1,
                            columnIndex + 1
                          )
                            ? 0
                            : -1
                        }
                        onFocus={() =>
                          setActiveCell({
                            rowId: null,
                            columnIndex: columnIndex + 1,
                          })
                        }
                        onClick={() =>
                          handleSort(column.accessorKey)
                        }
                      >
                        <span>{column.header}</span>

                        <span aria-hidden="true">
                          {isSorted
                            ? sortDirection === 'asc'
                              ? ' ↑'
                              : ' ↓'
                            : ' ↕'}
                        </span>
                      </button>
                    ) : (
                      <span
                        data-grid-nav="true"
                        data-nav-row={-1}
                        data-nav-col={columnIndex + 1}
                        tabIndex={
                          isActiveCell(
                            -1,
                            columnIndex + 1
                          )
                            ? 0
                            : -1
                        }
                        onFocus={() =>
                          setActiveCell({
                            rowId: null,
                            columnIndex: columnIndex + 1,
                          })
                        }
                        className="grid-header-text"
                      >
                        {column.header}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item, rowIndex) => {
              const rowId = getRowId(item);
              const isSelected = selectedIds.has(rowId);

              const record = item as T & {
                name?: string;
              };

              const rowLabel = String(
                record.name ?? rowId
              );

              return (
                <tr
                  key={rowId}
                  aria-selected={isSelected}
                  className={
                    isSelected ? 'selected-row' : ''
                  }
                >
                  {/* Selection checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${rowLabel}`}
                      checked={isSelected}
                      onChange={() => toggleRow(item)}
                      data-grid-nav="true"
                      data-nav-row={rowIndex}
                      data-nav-col={0}
                      tabIndex={
                        isActiveCell(rowIndex, 0)
                          ? 0
                          : -1
                      }
                      onFocus={() =>
                        setActiveCell({
                          rowId,
                          columnIndex: 0,
                        })
                      }
                    />
                  </td>

                  {/* Data cells */}
                  {columns.map((column, columnIndex) => (
                    <td
                      key={String(column.accessorKey)}
                      headers={
                        `${headerIdPrefix}-${columnIndex}`
                      }
                      data-grid-nav="true"
                      data-nav-row={rowIndex}
                      data-nav-col={columnIndex + 1}
                      tabIndex={
                        isActiveCell(
                          rowIndex,
                          columnIndex + 1
                        )
                          ? 0
                          : -1
                      }
                      onFocus={() =>
                        setActiveCell({
                          rowId,
                          columnIndex: columnIndex + 1,
                        })
                      }
                    >
                      {String(item[column.accessorKey])}
                    </td>
                  ))}
                </tr>
              );
            })}

            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="empty-state"
                >
                  No employees match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <p role="status">
          Showing {paginatedData.length} of{' '}
          {sortedData.length} employees
          {' · '}
          {selectedIds.size} selected
        </p>

        <div className="pagination-controls">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() =>
              handlePageChange(safePage - 1)
            }
          >
            Previous
          </button>

          <span aria-live="polite">
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() =>
              handlePageChange(safePage + 1)
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
