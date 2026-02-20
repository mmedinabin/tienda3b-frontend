import { create } from 'zustand';

export const useContextStore = create((set) => ({
  sucursalActiva: null,   // null = todas (solo admin)
  setSucursalActiva: (id) => set({ sucursalActiva: id })
}));