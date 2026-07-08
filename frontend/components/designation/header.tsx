import { Plus } from "lucide-react";
import PrimaryButton from "../common/PrimaryButton";
import SearchInput from "../common/SearchInput";

interface Props {
  onCreate: () => void;
  search: string;
  onSearch: (v: string) => void;
  total: number;
}

export default function Header({ onCreate, search, onSearch, total }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Designations</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
          {total} {total === 1 ? "designation" : "designations"} configured
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>      
        <SearchInput
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search designations…"
        />
        <PrimaryButton
          title="Add Designation"
          icon={<Plus size={13}/>}
          onClick={onCreate}
        />
      </div>
    </div>
  );
}