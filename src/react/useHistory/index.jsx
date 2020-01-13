import { useContext } from 'react';
import router from '../../core/Router';
import stack from '../../core/Stack';
import { RouterContext } from '../context';

const useHistory = () => {
  const { next, prev } = useContext(RouterContext);

  return {
    current: stack.get(next),
    currentIndex: router.currentIndex,
    previous: stack.get(prev),
  };
};

export default useHistory;
