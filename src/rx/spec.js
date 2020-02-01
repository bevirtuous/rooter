import router from '../core/Router';
import { push$, pop$, replace$, reset$ } from '.';

describe('rx', () => {
  it('should subscribe to push events', (done) => {
    const callback = jest.fn();

    push$.subscribe(callback);

    router.push({ pathname: '/somewhere' })
      .then(({ next, prev }) => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({
          action: 'PUSH',
          next,
          prev,
        });
        done();
      });
  });

  it('should subscribe to pop events', (done) => {
    const callback = jest.fn();

    pop$.subscribe(callback);

    router.pop()
      .then(({ next, prev }) => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({
          action: 'POP',
          next,
          prev,
        });
        done();
      });
  });

  it('should subscribe to pop events', (done) => {
    const callback = jest.fn();

    replace$.subscribe(callback);

    router.replace({ pathname: '/somewhere/else' })
      .then(({ next, prev }) => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({
          action: 'REPLACE',
          next,
          prev,
        });
        done();
      });
  });

  it('should subscribe to reset events', async (done) => {
    const callback = jest.fn();

    reset$.subscribe(callback);

    await router.push({ pathname: '/somewhere' });
    router.reset()
      .then(({ next, prev }) => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({
          action: 'RESET',
          next,
          prev,
        });
        done();
      });
  });
});
