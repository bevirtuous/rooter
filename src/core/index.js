import router from './Router';
import setQuery from './setQuery';

export const history = {
  back: router.pop,
  current: router.getCurrentRoute,
  listen: router.listen,
  push: router.push,
  go: router.push,
  pop: router.pop,
  replace: router.replace,
  reset: router.reset,
  setQuery,
};

export {
  PUSH,
  POP,
  REPLACE,
  RESET,
} from './constants';
