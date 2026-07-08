import PrimaryButton from "../common/PrimaryButton";
import SearchInput from "../common/SearchInput";

interface Props {
  onCreate: () => void;
  search: string;
  onSearch: (v: string) => void;
  total: number;
}

export default function CompanyHeader({ onCreate, search, onSearch, total }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Employees
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
          {total} registered {total === 1 ? "employee" : "employees"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}      
        <SearchInput
          value={search}
          placeholder="Search Employees..."
          onChange={onSearch}
        />
        {/* Add button */}    


      
        <PrimaryButton
          title="Add Employee"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>}
          permission="employee.create"
          onClick={onCreate}
        />
      </div>
    </div>
  );
}