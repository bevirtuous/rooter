import router from '../../core/Router';
import useHistory from '../useHistory';

function RouteNotFound({ children }) {
  const { current } = useHistory();

  if (router.match(current.pathname)) {
    return null;
  }

  return children;
}

export default RouteNotFound;
