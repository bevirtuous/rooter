import React, { useState } from 'react';
import { RouteContext } from '../context';
import matcher from '../../core/matcher';
import useHistory from '../useHistory';
import useRoute from '../useRoute';

function Route({ children, component: Component, path, exact = false }) {
  const { current } = useHistory();
  const parent = useRoute();
  const pattern = (parent ? parent.pattern : '') + path;
  const matchOptions = {
    end: exact || path === '/',
  };
  const [matchFn] = useState(() => matcher(pattern, matchOptions));
  const match = matchFn(current.pathname);

  if (!match) {
    return null;
  }

  const contextValue = {
    ...current,
    params: match,
    pattern,
  };

  return (
    <RouteContext.Provider key={current.id} value={contextValue}>
      {children || <Component />}
    </RouteContext.Provider>
  );
}

export default Route;
