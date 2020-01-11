import router from './Router';

export * from './events';

export const history = {
  push: router.push,
  pop: router.pop,
  replace: router.replace,
  reset: router.reset,
  resetTo: router.resetTo,
  update: router.update,
};
