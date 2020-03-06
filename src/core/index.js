import router from './Router';

export const history = {
  current: router.getCurrentRoute,
  push: router.push,
  pop: router.pop,
  replace: router.replace,
  reset: router.reset,
  update: router.update,
};

export const register = router.register;
export * from './constants';
export { default as emitter } from './emitter';
