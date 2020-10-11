import React, { useEffect, useState } from 'react';
import router from '../../core/Router';
import { applyPlugins } from '../../core/plugins';
import { RouterContext } from '../context';

function Router({ children }) {
  const [routes, setRoutes] = useState({
    prev: null,
    next: applyPlugins(router.getCurrentRoute()),
  });

  useEffect(() => router.listen(({ next }) => {
    setRoutes(({ next: prev }) => ({
      prev,
      next: applyPlugins(next),
    }));
  }), []);

  return (
    <RouterContext.Provider value={routes}>
      {children}
    </RouterContext.Provider>
  );
}

export default Router;
