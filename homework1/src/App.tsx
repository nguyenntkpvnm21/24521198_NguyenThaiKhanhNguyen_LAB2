
import { DataGrid } from './components/DataGrid/DataGrid';
import { employees } from './data/employees';
import type { ColumnDef } from './types/data-grid-contract';
import type { Employee } from './types/employee';
import './App.css';

const columns: ColumnDef<Employee>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
    sortable: true,
  },
  {
    header: 'Employee Name',
    accessorKey: 'name',
    sortable: true,
  },
  {
    header: 'Department',
    accessorKey: 'department',
    sortable: true,
  },
  {
    header: 'Email',
    accessorKey: 'email',
    sortable: false,
  },
  {
    header: 'Salary (VND)',
    accessorKey: 'salary',
    sortable: true,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
  },
];

function App() {
  return (
    <main className="app">
      <header className="page-header">
        <p className="eyebrow">ENTERPRISE MANAGEMENT</p>
        <h1>Employee Data Grid</h1>
        <p className="description">
          Manage, explore, and organize employee records.
        </p>
      </header>

      <section className="grid-section" aria-labelledby="grid-title">
        <div className="section-heading">
          <h2 id="grid-title">Employee Directory</h2>
          <p>{employees.length} employees</p>
        </div>

        <DataGrid
  data={employees}
  columns={columns}
  getRowId={(employee) => employee.id}
  ariaLabel="Employee directory data grid"
/>
      </section>
    </main>
  );
}

export default App;
