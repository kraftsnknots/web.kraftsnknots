// src/features/ordersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

let unsubscribeOrders = null;

// 🔹 Real-time listener setup
export const listenToUserOrders = createAsyncThunk(
  "orders/listenToUserOrders",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const db = getFirestore(getApp());
      const storage = getStorage(getApp());
      const q = query(collection(db, "successOrders"), where("userId", "==", userId));

      // 🔸 If already subscribed, stop previous listener
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }

      // 🔸 Real-time Firestore listener
      unsubscribeOrders = onSnapshot(
        q,
        async (snapshot) => {
          const updatedOrders = [];

          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            let invoiceUrl = "#";

            if (data.invoiceUrl) {
              try {
                const fileRef = ref(storage, data.invoiceUrl);
                invoiceUrl = await getDownloadURL(fileRef);
              } catch (err) {
                console.warn("Invoice URL fetch failed:", err.message);
              }
            }

            updatedOrders.push({
              id: docSnap.id,
              ...data,
              invoiceUrl,
            });
          }

          // Dispatch internal reducer to update list
          dispatch(setOrders(updatedOrders));
        },
        (error) => {
          console.error("❌ Firestore onSnapshot error:", error);
          dispatch(setError(error.message));
        }
      );

      return true;
    } catch (err) {
      console.error("❌ Failed to start real-time listener:", err);
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Slice
const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    list: [],
    status: "idle", // idle | listening | error
    error: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.list = action.payload;
      state.status = "listening";
      state.error = null;
    },
    setError: (state, action) => {
      state.status = "error";
      state.error = action.payload;
    },
    clearOrders: (state) => {
      state.list = [];
      state.status = "idle";
      state.error = null;
      if (unsubscribeOrders) {
        unsubscribeOrders();
        unsubscribeOrders = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listenToUserOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(listenToUserOrders.fulfilled, (state) => {
        state.status = "listening";
      })
      .addCase(listenToUserOrders.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      });
  },
});

export const { setOrders, setError, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
