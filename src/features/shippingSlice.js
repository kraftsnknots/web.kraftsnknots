// src/features/shippingAddressesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getApp } from "firebase/app";

let unsubscribeShipping = null;

// 🔹 Real-time listener
export const listenToUserShippingAddresses = createAsyncThunk(
  "shippingAddresses/listenToUserShippingAddresses",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const db = getFirestore(getApp());
      const q = query(
        collection(db, "shippingAddresses"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
      );

      if (unsubscribeShipping) unsubscribeShipping();

      unsubscribeShipping = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          dispatch(setAddresses(list));
        },
        (err) => {
          console.error("Listener error:", err);
          dispatch(setError(err.message));
        }
      );

      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Edit address
export const updateShippingAddress = createAsyncThunk(
  "shippingAddresses/updateShippingAddress",
  async ({ id, updatedData }, { rejectWithValue }) => { 
    try {
      const db = getFirestore(getApp());
      await updateDoc(doc(db, "shippingAddresses", id), updatedData);
      return { id, updatedData };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Delete address
export const deleteShippingAddress = createAsyncThunk(
  "shippingAddresses/deleteShippingAddress",
  async (id, { rejectWithValue }) => {
    try {
      const db = getFirestore(getApp());
      await deleteDoc(doc(db, "shippingAddresses", id));
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const shippingSlice = createSlice({
  name: "shippingAddresses",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setAddresses: (state, action) => {
      state.list = action.payload;
      state.status = "listening";
    },
    setError: (state, action) => {
      state.status = "error";
      state.error = action.payload;
    },
    clearAddresses: (state) => {
      state.list = [];
      state.status = "idle";
      state.error = null;
      if (unsubscribeShipping) {
        unsubscribeShipping();
        unsubscribeShipping = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listenToUserShippingAddresses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(listenToUserShippingAddresses.fulfilled, (state) => {
        state.status = "listening";
      })
      .addCase(listenToUserShippingAddresses.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      });
  },
});

export const { setAddresses, setError, clearAddresses } = shippingSlice.actions;
export default shippingSlice.reducer;
