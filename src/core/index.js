import router from './Router';

export const history = {
  back: router.pop,
  current: router.getCurrentRoute,
  push: router.push,
  go: router.push,
  pop: router.pop,
  replace: router.replace,
  reset: router.reset,
  setMeta: router.update,
};

export const register = router.register;
export * from './constants';
export { default as emitter } from './emitter';
