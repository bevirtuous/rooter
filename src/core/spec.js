import { history } from './index';
import router from './Router';

describe('Core API', () => {
  it('should export correct API', () => {
    expect(history.push).toBe(router.push);
    expect(history.pop).toBe(router.pop);
    expect(history.replace).toBe(router.replace);
    expect(history.reset).toBe(router.reset);
    expect(history.update).toBe(router.update);
  });
});
