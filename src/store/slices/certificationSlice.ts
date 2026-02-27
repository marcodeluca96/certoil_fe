import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../consts";
import type {
  CertificationResponse,
  CertificationState,
  LockMetadataResponse,
} from "../../types/certification";

const initialState: CertificationState = {
  items: [],
  lockMetadata: [],
  loading: false,
  loadingLockMetadata: null,
  error: null,
  currentPage: 1,
  pageSize: 10,
};

export const fetchCertifications = createAsyncThunk(
  "certification/fetchCertifications",
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get<CertificationResponse>(
        `${API_URL}/api/certifications?page=${page}&limit=${limit}`,
      );
      return { items: response.data.data, page, limit };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch certifications");
    }
  },
);
export const fetchLockMetadataCertifications = createAsyncThunk(
  "certification/fetchLockMetadataCertifications",
  async (notarizationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<LockMetadataResponse>(
        `${API_URL}/iota/${notarizationId}/lock-metadata`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch certifications");
    }
  },
);

const certificationSlice = createSlice({
  name: "certification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.currentPage = action.payload.page;
        state.pageSize = action.payload.limit;
      })
      .addCase(fetchCertifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLockMetadataCertifications.fulfilled, (state, action) => {
        const existingLockMetadata = state.lockMetadata.find(
          (item) => item.notarizationId === action.payload.notarizationId,
        );
        if (existingLockMetadata) {
          state.lockMetadata = state.lockMetadata.map((item) =>
            item.notarizationId === action.payload.notarizationId ? action.payload : item,
          );
        } else {
          state.lockMetadata.push(action.payload);
        }
        state.loadingLockMetadata = null;
      })
      .addCase(fetchLockMetadataCertifications.rejected, (state, action) => {
        state.loadingLockMetadata = null;
        state.error = action.payload as string;
      })
      .addCase(fetchLockMetadataCertifications.pending, (state, action) => {
        state.loadingLockMetadata = action.meta.arg;
        state.error = null;
      });
  },
});

export default certificationSlice.reducer;
