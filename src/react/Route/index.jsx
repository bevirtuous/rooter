import React, { useEffect, useState } from 'react';
import router from '../../core/Router';
import RouteNotFound from '../404';
import { RouteContext } from '../context';
import useHistory from '../useHistory';

function Route({ children, path }) {
  const { current: route } = useHistory();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    router.register(path);
  }

  if (route.pattern !== path) {
    return null;
  }

  const key = `${route.id}-${route.pathname}`;

  return (
    <RouteContext.Provider key={key} value={route}>
      {children}
    </RouteContext.Provider>
  );
}

Route.NotFound = RouteNotFound;

export default Route;
