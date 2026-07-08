import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Feature {
  feature_id: {
    slug: string;
  };
}

interface Plan {
  name: string;
  features: Feature[];
}

interface BranchPlan {
  plan_id: Plan
}
export interface Branch {
  _id: string;
  branchName: string;
  plan?: BranchPlan;
}

interface BranchState {
  activeBranch: Branch | null;
}

const initialState: BranchState = {
  activeBranch: null,
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setActiveBranch: (
      state,
      action: PayloadAction<Branch | null>
    ) => {
      state.activeBranch = action.payload;
    },

    clearActiveBranch: (state) => {
      state.activeBranch = null;
    },
  },
});

export const {
  setActiveBranch,
  clearActiveBranch,
} = branchSlice.actions;

export default branchSlice.reducer;