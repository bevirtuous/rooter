import React, { useState } from 'react';
import { RouteContext } from '../context';
import matcher from '../../core/matcher';
import useHistory from '../useHistory';

function Route({ children, component: Component, path }) {
  const [matchFn] = useState(() => matcher(path));
  const { current } = useHistory();

  const match = matchFn(current.pathname);

  if (!match) {
    return null;
  }

  const contextValue = {
    ...current,
    params: match,
  };

  return (
    <RouteContext.Provider key={current.id} value={contextValue}>
      {children || <Component />}
    </RouteContext.Provider>
  );
}

export default Route;
