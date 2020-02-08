import { useContext } from 'react';
import { RouteContext } from '../context';

/**
 * @returns {Object}
 */
function useRoute() {
  return useContext(RouteContext);
}

export default useRoute;
