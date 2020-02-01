import { useContext } from 'react';
import router from '../../core/Router';
import { RouteContext } from '../context';

/**
 * @returns {Object}
 */
function useRoute() {
  const route = useContext(RouteContext);

  return {
    ...route,
    update: (state) => {
      router.update(route.id, state);
    },
  };
}

export default useRoute;