import { useContext } from 'react';
import { RouteContext } from '../context';
import setQuery from '../../core/setQuery';

function useQuery() {
  const { query } = useContext(RouteContext);

  return [query, setQuery];
}

export default useQuery;
