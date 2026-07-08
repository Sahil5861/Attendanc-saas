import { ArrowBigLeft, ArrowLeft } from "lucide-react";
import Button from "../common/Button";
import { useRouter } from "next/navigation";

interface Props {
  onCreate: () => void;
  search: string;
  onSearch: (v: string) => void;
  total: number;
}

export default function FeatureHeader({ onCreate, search, onSearch, total }: Props) {
  const router = useRouter();
  return (

    <>
      <div style={{textAlign:'left', marginBottom: 20 }}>
        <Button
          outline
          onClick={()=> router.back()}
          type="success"
          title="Back"
          icon={<ArrowLeft size={13}/>}
        />
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>


        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Features</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
            {total} {total === 1 ? "feature" : "features"} configured
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" placeholder="Search features…" value={search}
              onChange={e => onSearch(e.target.value)}
              style={{
                paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                border: "1.5px solid #d1fae5", borderRadius: 10, fontSize: 14,
                outline: "none", width: 210, color: "#0f172a", background: "#fff",
                transition: "border-color .2s, box-shadow .2s"
              }}
              onFocus={e => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#d1fae5"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <button
            onClick={onCreate}
            style={{
              background: "linear-gradient(135deg, #059669, #0891b2)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "10px 20px", fontSize: 14, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              transition: "transform .2s, box-shadow .2s", whiteSpace: "nowrap"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(5,150,105,.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Feature
          </button>
        </div>
      </div>
    </>
  );
}