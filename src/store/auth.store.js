import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      permisos: [],
      sucursalActiva: null,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      isAuthenticated: () => !!get().token,

      /* ================= LOGIN ================= */
      login: ({ token }) => {
        set({ token })
      },

      /* ================= PERFIL ================= */
      setPerfil: (user, permisos = []) => {
        set({
          user,
          permisos,
          sucursalActiva: user?.sucursal_id ?? null,
        })
      },

      /* ================= CAMBIAR SUCURSAL ================= */
      setSucursalActiva: (sucursalId) => {
        set({ sucursalActiva: sucursalId || null })
      },

      /* ================= LOGOUT ================= */
      logout: () => {
        set({
          token: null,
          user: null,
          permisos: [],
          sucursalActiva: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
    },
  ),
)
