import SearchInput from "../common/SearchInput";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  total: number;
}

export default function Header({ search, onSearch, total }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Subscriptions</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
          {total} {total === 1 ? "subscription" : "subscriptions"} configured
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>     
        <SearchInput
          value={search}
          onChange={(value: string) => onSearch(value)}
          placeholder="Search Subscriptions..."
        />
      </div>
    </div>
  );
}