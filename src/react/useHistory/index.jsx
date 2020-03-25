import { useContext } from 'react';
import router from '../../core/Router';
import { RouterContext } from '../context';

const useHistory = () => {
  const { next, prev } = useContext(RouterContext);

  return {
    current: next,
    currentIndex: router.currentIndex,
    previous: prev,
  };
};

export default useHistory;
