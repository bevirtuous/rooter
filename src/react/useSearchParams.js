import { useMemo } from 'react';
import useLocation from './useLocation';
import parseSearchParams from '../plugins/parseSearchParams';

function useSearchParams(options) {
  const { search } = useLocation();

  return useMemo(() => parseSearchParams(search, options), [options, search]);
}

export default useSearchParams;
