import { history } from './index';
import router from './Router';
import setQuery from './setQuery';

describe('Core API', () => {
  it('should map to router internal methods', () => {
    expect(history.go).toBe(router.push);
    expect(history.push).toBe(router.push);
    expect(history.back).toBe(router.pop);
    expect(history.listen).toBe(router.listen);
    expect(history.pop).toBe(router.pop);
    expect(history.replace).toBe(router.replace);
    expect(history.reset).toBe(router.reset);
    expect(history.current).toBe(router.getCurrentRoute);
    expect(history.setQuery).toBe(setQuery);
  });
});
