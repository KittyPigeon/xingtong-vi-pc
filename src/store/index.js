import { createStore } from 'vuex';

export default createStore({
  state: {
    sidebarOpen: false,
  },
  mutations: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar(state, open) {
      state.sidebarOpen = !!open;
    },
  },
});
