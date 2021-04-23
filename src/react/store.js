import history from 'history/browser';
import create from 'zustand';

function createStoreEntry(location) {
  const { hash, key, pathname, search, state } = location;
  return {
    fragment: hash,
    id: key || 'default',
    pathname,
    search,
    state: state || {},
  };
}

export default create((set) => {
  const route = createStoreEntry(history.location);

  return {
    current: 0,
    routes: [route],
    back: () => set((state) => ({
      current: Math.max(0, state.current - 1),
    })),
    forward: () => set((state) => ({
      current: Math.min(state.routes.length - 1, state.current + 1),
    })),
    push: (location) => set((state) => {
      const nextCurrent = state.current + 1;
      const nextRoute = state.routes[nextCurrent];

      if (nextRoute && nextRoute.id === location.key) {
        return state.forward(location);
      }

      const nextRoutes = state.routes
        .slice(0, nextCurrent)
        .concat(createStoreEntry(location));

      return {
        current: nextCurrent,
        routes: nextRoutes,
      };
    }),
  };
});
