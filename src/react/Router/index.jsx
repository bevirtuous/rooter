import React, { useEffect, useState } from 'react';
import router from '../../core/Router';
import routeStack from '../../core/Stack';
import { RouterContext } from '../context';
import { EVENT, UPDATE } from '../../core/constants';
import emitter from '../../core/emitter';

function Router({ children, history }) {
  const [routes, setRoutes] = useState({
    prev: null,
    next: router.getCurrentRoute().id,
  });

  function handleChange({ prev, next }) {
    setRoutes({
      prev: prev ? prev.id : null,
      next: next.id,
    });
  }

  function handleUpdate(next) {
    setRoutes((old) => ({
      prev: old.prev,
      next: next.id,
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

    emitter.on(EVENT, handler);

    return () => emitter.off(EVENT, handler);
  }, []);

  useEffect(() => {
    if (history) {
      router.constructor(history);
    }
  }, [history]);

  const { prev, next } = routes;
  const stack = Array.from(routeStack.getAll());

  return (
    <RouterContext.Provider value={{ prev, next, stack }}>
      {children}
    </RouterContext.Provider>
  );
}

Router.defaultProps = {
  history: null,
};

export default Router;
