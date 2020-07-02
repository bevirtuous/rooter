import React, { useEffect, useState } from 'react';
import router from '../../core/Router';
import { RouteContext } from '../context';
import useHistory from '../useHistory';

function Route({ children, path }) {
  const { current } = useHistory();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    router.register(path);
  }

  if (current.pattern !== path) {
    return null;
  }

  const key = `${current.id}-${current.pathname}`;

  return (
    <RouteContext.Provider key={key} value={current}>
      {children}
    </RouteContext.Provider>
  );
}

export default Route;
