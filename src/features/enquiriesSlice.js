// src/features/enquiriesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getApp } from "firebase/app";

let unsubscribeEnquiries = null;

/* -------------------------------------------------------
   🔥 REAL-TIME LISTENER — Filter by EMAIL, not userId
-------------------------------------------------------- */
export const listenToUserEnquiries = createAsyncThunk(
  "enquiries/listenToUserEnquiries",
  async (userEmail, { dispatch, rejectWithValue }) => {
    try {
      if (!userEmail) {
        return rejectWithValue("No authenticated email provided");
      }

      const db = getFirestore(getApp());
      const q = query(
        collection(db, "contactFormQueries"),
        where("email", "==", userEmail),
        where("deleted", "==", 0),
        orderBy("createdAt", "desc")
      );

      if (unsubscribeEnquiries) unsubscribeEnquiries();

      unsubscribeEnquiries = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          dispatch(setEnquiries(list));
        },
        (error) => {
          console.error("Realtime enquiry listener error:", error);
          dispatch(setError(error.message));
        }
      );

      return true;
    } catch (err) {
      console.error("Failed to start enquiries listener:", err);
      return rejectWithValue(err.message);
    }
  }
);

/* -------------------------------------------------------
   🔥 SUBMIT ENQUIRY — Anyone can submit (no login required)
-------------------------------------------------------- */
export const submitEnquiry = createAsyncThunk(
  "enquiries/submitEnquiry",
  async ({ name, email, phone, message, sentFrom }, { rejectWithValue }) => {
    try {
      const db = getFirestore(getApp());

      const formDetails = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        sentFrom: sentFrom || "Website",
        deleted: 0,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "contactFormQueries"), formDetails);

      return { success: true };
    } catch (err) {
      console.error("Submit enquiry failed:", err);
      return rejectWithValue(err.message);
    }
  }
);

/* -------------------------------------------------------
   🔥 SLICE
-------------------------------------------------------- */
const enquiriesSlice = createSlice({
  name: "enquiries",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setEnquiries: (state, action) => {
      state.list = action.payload;
      state.status = "listening";
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = "error";
    },
    clearEnquiries: (state) => {
      state.list = [];
      state.status = "idle";
      state.error = null;

      if (unsubscribeEnquiries) {
        unsubscribeEnquiries();
        unsubscribeEnquiries = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listenToUserEnquiries.pending, (state) => {
        state.status = "loading";
      })
      .addCase(listenToUserEnquiries.fulfilled, (state) => {
        state.status = "listening";
      })
      .addCase(listenToUserEnquiries.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })

      .addCase(submitEnquiry.pending, (state) => {
        state.status = "submitting";
      })
      .addCase(submitEnquiry.fulfilled, (state) => {
        state.status = "listening";
      })
      .addCase(submitEnquiry.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      });
  },
});

export const { setEnquiries, setError, clearEnquiries } = enquiriesSlice.actions;
export default enquiriesSlice.reducer;
