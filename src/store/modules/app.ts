import { defineStore } from 'pinia';

interface AppState {
  sidebarOpen: boolean;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarOpen: false,
  }),

  getters: {
    isSidebarOpen: (state) => state.sidebarOpen,
  },

  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    setSidebar(open: boolean) {
      this.sidebarOpen = open;
    },
  },
});
