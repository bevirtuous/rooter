import React from 'react';
import Context from './context';
import usePath from './usePath';
import useLocation from './useLocation';

function Route({ children, exact = false, path }) {
  const location = useLocation();
  const { isExactMatch, isMatch, params } = usePath(path);
  const isVisible = exact ? isExactMatch : isMatch;

  if (!isVisible) {
    return null;
  }

  return (
    <Context.Provider value={{ ...location, params, pattern: path }}>
      {children}
    </Context.Provider>
  );
}

export default Route;