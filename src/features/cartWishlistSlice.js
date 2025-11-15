import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  wishlist: [],
  appliedCoupon: null, // ⭐ NEW: globally applied coupon
};

const cartWishlistSlice = createSlice({
  name: "cartWishlist",
  initialState,
  reducers: {
    // 🛒 CART ACTIONS
    addToCart: (state, action) => {
      const item = action.payload;
      const exists = state.cart.find((x) => x.id === item.id);

      if (exists) {
        exists.quantity = (exists.quantity || 1) + (item.quantity || 1);
      } else {
        state.cart.push({
          ...item,
          quantity: item.quantity || 1,
        });
      }
    },

    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },

    clearCart: (state) => {
      state.cart = [];
      state.appliedCoupon = null; // Clear coupon automatically
    },

    updateCartQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cart.find((x) => x.id === id);
      if (item && quantity >= 1) {
        item.quantity = quantity;
      }
    },

    // 💖 WISHLIST ACTIONS
    addToWishlist: (state, action) => {
      const item = action.payload;
      const exists = state.wishlist.find((x) => x.id === item.id);
      if (!exists) state.wishlist.push(item);
    },

    removeFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter((item) => item.id !== action.payload);
    },

    clearWishlist: (state) => {
      state.wishlist = [];
    },

    // 🎁 COUPON ACTIONS (GLOBAL) ⭐⭐⭐
    setCoupon: (state, action) => {
      state.appliedCoupon = action.payload;  
      // payload example:
      // {
      //   code: "NY25",
      //   name: "New Year Festive",
      //   type: "Percentage",
      //   value: 25
      // }
    },

    clearCoupon: (state) => {
      state.appliedCoupon = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  updateCartQuantity,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setCoupon,      // ⭐ exported
  clearCoupon,    // ⭐ exported
} = cartWishlistSlice.actions;

export default cartWishlistSlice.reducer;
