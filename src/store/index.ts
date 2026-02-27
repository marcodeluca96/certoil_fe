import { configureStore } from "@reduxjs/toolkit";
import certificationReducer from "./slices/certificationSlice";

export const store = configureStore({
  reducer: {
    certification: certificationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
