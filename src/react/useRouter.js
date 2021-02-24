import { useEffect } from 'react';
import history from 'history/browser';
import useStore from './store';

function useRouter(plugins = []) {
  const back = useStore(state => state.back);
  const push = useStore(state => state.push);

  useEffect(() => {
    const listener = history.listen(({ action, location }) => {
      if (action === 'POP') {
        back();
      } else {
        push(location);
      }
    });

    return () => listener();
  }, []);

  return 123;
}

export default useRouter;
