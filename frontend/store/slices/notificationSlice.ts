import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
    unreadCount: number;
}

const initialState: NotificationState = {
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        setUnreadCount(state, action: PayloadAction<number>) {
            state.unreadCount = action.payload;
        },

        decrementUnreadCount(state) {
            if (state.unreadCount > 0) {
                state.unreadCount--;
            }
        },

        incrementUnreadCount(state) {
            state.unreadCount++;
        },

        resetUnreadCount(state) {
            state.unreadCount = 0;
        }
    }
});

export const {
    setUnreadCount,
    decrementUnreadCount,
    incrementUnreadCount,
    resetUnreadCount
} = notificationSlice.actions;

export default notificationSlice.reducer;