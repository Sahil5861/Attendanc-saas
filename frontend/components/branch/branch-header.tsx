import PrimaryButton from "../common/PrimaryButton";

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
          Branches
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
          {total} registered {total === 1 ? "company" : "companies"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search branches…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            style={{
              paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
              border: "1.5px solid #d1fae5", borderRadius: 10,
              fontSize: 14, outline: "none", width: 220, color: "#0f172a",
              background: "#fff",
              transition: "border-color .2s, box-shadow .2s"
            }}
            onFocus={e => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,.12)"; }}
            onBlur={e => { e.target.style.borderColor = "#d1fae5"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Add button */}    

        <PrimaryButton
          title="Add Branches"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>}
          permission="branch.create"
          onClick={onCreate}
        />
      </div>
    </div>
  );
}