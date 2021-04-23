import { useEffect } from 'react';
import history from 'history/browser';
import useStore from './store';

function Router({ children }) {
  const back = useStore((state) => state.back);
  const push = useStore((state) => state.push);
  const nextRoute = useStore((state) => state.routes[state.current + 1]);

  useEffect(() => {
    const listener = history.listen(({ action, location }) => {
      if (action === 'PUSH' || (nextRoute && location.key === nextRoute.id)) {
        push(location);
      } else {
        back();
      }
    });

    return () => listener();
  }, [back, nextRoute, push]);

  return children;
}

export default Router;
