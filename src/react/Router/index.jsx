import React, { useEffect, useState } from 'react';
import router from '../../core/Router';
import { RouterContext } from '../context';

function Router({ children }) {
  const [routes, setRoutes] = useState({
    prev: null,
    next: router.getCurrentRoute(),
  });

  useEffect(() => {
    const listener = router.listen(({ next, prev }) => {
      setRoutes({
        prev,
        next,
      });
    });

    return () => listener();
  }, []);

  return (
    <RouterContext.Provider value={routes}>
      {children}
    </RouterContext.Provider>
  );
}

export default Router;
