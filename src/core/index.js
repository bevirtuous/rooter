import router from './Router';

export const history = {
  back: router.pop,
  current: router.getCurrentRoute,
  listen: router.listen,
  push: router.push,
  go: router.push,
  pop: router.pop,
  replace: router.replace,
  reset: router.reset,
};

export {
  PUSH,
  POP,
  REPLACE,
  RESET,
} from './constants';
