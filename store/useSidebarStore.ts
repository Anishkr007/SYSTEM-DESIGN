import { create } from 'zustand'

interface SidebarStore {
  isOpen: boolean
  activeTopic: string | null
  expandedCategories: Set<string>
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveTopic: (slug: string | null) => void
  toggleCategory: (category: string) => void
  isCategoryExpanded: (category: string) => boolean
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  isOpen: true,
  activeTopic: null,
  expandedCategories: new Set(['load-balancing', 'database', 'basics']),

  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),

  setSidebarOpen: (open: boolean) => set({ isOpen: open }),

  setActiveTopic: (slug: string | null) => set({ activeTopic: slug }),

  toggleCategory: (category: string) =>
    set((state) => {
      const next = new Set(state.expandedCategories)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return { expandedCategories: next }
    }),

  isCategoryExpanded: (category: string) =>
    get().expandedCategories.has(category),
}))
