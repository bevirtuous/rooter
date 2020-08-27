import React, { useEffect, useState } from 'react';
import router from '../../core/Router';
import { RouterContext } from '../context';
import { UPDATE } from '../../core/constants';

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

  function handleUpdate(next) {
    setRoutes((old) => ({
      prev: old.prev,
      next,
    }));
  }

  useEffect(() => {
    function handler(params) {
      if (params.action === UPDATE) {
        handleUpdate(params.route);
      } else {
        handleChange(params);
      }
    }

    const listener = router.listen(handler);

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
