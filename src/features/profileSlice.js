// src/features/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFirestore,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

let unsubscribeProfile = null;

// 🔹 Listen to user profile in realtime
export const listenToUserProfile = createAsyncThunk(
  "profile/listenToUserProfile",
  async (uid, { dispatch, rejectWithValue }) => {
    try {
      const db = getFirestore(getApp());
      const ref = doc(db, "users", uid);

      if (unsubscribeProfile) unsubscribeProfile();

      unsubscribeProfile = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            dispatch(setProfile(snapshot.data()));
          }
        },
        (err) => {
          console.error("Profile listener error:", err);
          dispatch(setError(err.message));
        }
      );
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async ({ uid, name, phone, croppedBlob }, { rejectWithValue }) => {
    try {
      console.log("🧩 updateUserProfile called with:", { uid, name, phone, croppedBlob });

      const db = getFirestore(getApp());
      const storage = getStorage(getApp());
      const userRef = doc(db, "users", uid);

      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;

      if (croppedBlob) {
        // in updateUserProfile thunk
        const fileRef = ref(storage, `userPictures/${uid}/profile.jpg`);
        await uploadBytes(fileRef, croppedBlob);
        const photoURL = await getDownloadURL(fileRef);

        updateData.photoURL = photoURL;
      }

      if (Object.keys(updateData).length === 0) {
        console.warn("⚠️ No fields to update!");
        return { skip: true };
      }

      console.log("🔥 Updating Firestore:", uid, updateData);
      await updateDoc(userRef, updateData);
      console.log("✅ Firestore update successful!");

      return updateData;
    } catch (err) {
      console.error("❌ Update error:", err);
      return rejectWithValue(err.message);
    }
  }
);



const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: {},
    status: "idle",
    error: null,
  },
  reducers: {
    setProfile: (state, action) => {
      state.data = action.payload;
      state.status = "listening";
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = "error";
    },
    clearProfile: (state) => {
      state.data = {};
      state.status = "idle";
      if (unsubscribeProfile) unsubscribeProfile();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listenToUserProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(listenToUserProfile.fulfilled, (state) => {
        state.status = "listening";
      })
      .addCase(listenToUserProfile.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.data = { ...state.data, ...action.payload };
      });
  },
});

export const { setProfile, setError, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
