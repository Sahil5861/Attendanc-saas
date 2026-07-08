interface Props {
  onCreate: () => void;
  search: string;
  onSearch: (v: string) => void;
  total: number;
}

import { useRouter } from "next/navigation";
import PrimaryButton from "../common/PrimaryButton";
import SearchInput from "../common/SearchInput";
import SecondaryButton from "../common/SecondaryButton";
import Can from "../common/Can";

export default function Header({ onCreate, search, onSearch, total }: Props) {

  const router = useRouter();


  // console.log('Header permissions : ', permissions);
  


  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Plans
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
          {total} {total === 1 ? "role" : "roles"} configured
        </p>
      </div>

      <div className="flex items-center gap-3">

        <SearchInput
          value={search}
          onChange={onSearch}
          placeholder="Search here..."
        />

          <PrimaryButton
            title="Add Plan"
            icon={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
            permission="plan.create"
            onClick={onCreate}
          />        
        

          <SecondaryButton
            title="Manage Features"
            permission="plan.create"
            onClick={() => router.push("/super-admin/features")}
          />
      </div>
    </div>
  );
}