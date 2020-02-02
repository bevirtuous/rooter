import router from './Router';

export const history = {
  push: router.push,
  pop: router.pop,
  replace: router.replace,
  reset: router.reset,
  update: router.update,
};
