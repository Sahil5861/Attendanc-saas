import { createSlice } from "@reduxjs/toolkit";

const layoutSlice = createSlice({
    name: "layout",
    initialState: {
        sidebarCollapsed: false,
    },
    reducers: {
        toggleSidebar(state) {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
    },
});

export const { toggleSidebar } = layoutSlice.actions;
export default layoutSlice.reducer;