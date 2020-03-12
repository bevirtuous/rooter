import router from './Router';
import setQuery from './setQuery';

export const history = {
  back: router.pop,
  current: router.getCurrentRoute,
  push: router.push,
  go: router.push,
  pop: router.pop,
  replace: router.replace,
  reset: router.reset,
  setMeta: router.update,
  setQuery,
};

export const register = router.register;
export * from './constants';
export { default as emitter } from './emitter';
