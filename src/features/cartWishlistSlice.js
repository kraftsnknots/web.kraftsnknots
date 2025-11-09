import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  wishlist: [],
};

const cartWishlistSlice = createSlice({
  name: "cartWishlist",
  initialState,
  reducers: { 
    // 🛒 CART actions
    addToCart: (state, action) => {
      const item = action.payload;
      
      const exists = state.cart.find((x) => x.id === item.id);
      if (!exists) state.cart.push(item);
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
    },

    // 💖 WISHLIST actions
    addToWishlist: (state, action) => {
      const item = action.payload;
      console.log(item);
      
      const exists = state.wishlist.find((x) => x.id === item.id);
      if (!exists) state.wishlist.push(item);
    },
    removeFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter((item) => item.id !== action.payload);
    },
    clearWishlist: (state) => {
      state.wishlist = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = cartWishlistSlice.actions;

export default cartWishlistSlice.reducer;
