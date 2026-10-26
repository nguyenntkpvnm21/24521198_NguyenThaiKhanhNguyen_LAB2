
export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
}

export interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (item: T) => string | number;
  onRowSelect?: (item: T) => void;
  ariaLabel: string;
}
