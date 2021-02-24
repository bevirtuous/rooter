import { useMemo, useRef } from 'react';
import matcher from '../core/matcher';
import useLocation from './useLocation';

function usePath(path) {
  const matchFn = useRef(matcher(path, {
    end: path === '/',
  }));
  const matchFnExact = useRef(matcher(path, {
    end: true,
  }));
  const location = useLocation();

  return useMemo(() => {
    const params = matchFn.current(location.pathname);
    const isExactMatch = !!matchFnExact.current(location.pathname);
    const isMatch = !!params;

    return {
      isExactMatch,
      isMatch,
      params,
    };
  }, [location.id])

}

export default usePath;