import React, { useEffect, useState } from 'react';
import router from '../../core/Router';
import { RouterContext } from '../context';

function Router({ children }) {
  const [routes, setRoutes] = useState({
    prev: null,
    next: router.getCurrentRoute(),
  });

  function handleChange({ prev, next }) {
    setRoutes({
      prev,
      next,
    });
  }

  useEffect(() => {
    const listener = router.listen(handleChange);

    return () => listener();
  }, []);

  return (
    <RouterContext.Provider value={routes}>
      {children}
    </RouterContext.Provider>
  );
}

Router.defaultProps = {
  history: null,
};

export default Router;
