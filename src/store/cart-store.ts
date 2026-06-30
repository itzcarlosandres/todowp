"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  productSlug: string;
  productTitle: string;
  productImage: string;
  price: number;
  salePrice: number | null;
  license: "SINGLE" | "UNLIMITED";
  quantity: number;
  addedAt: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "addedAt" | "quantity"> & { quantity?: number }) => void;
  remove: (productId: string, license: CartItem["license"]) => void;
  updateQuantity: (productId: string, license: CartItem["license"], quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.license === item.license,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.license === item.license
                  ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: item.quantity ?? 1, addedAt: Date.now() },
            ],
          };
        }),
      remove: (productId, license) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.license === license),
          ),
        })),
      updateQuantity: (productId, license, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.license === license
              ? { ...i, quantity: Math.max(0, quantity) }
              : i,
          ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: "marketflow-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
