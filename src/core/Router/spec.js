import router from './index';
import stack from '../Stack';
import history from '../history';
import * as constants from '../constants';
import * as errors from './errors';

const pathname1 = '/myroute/123';

let listener = () => {};

describe('Router', () => {
  beforeEach(() => {
    router.init();
    listener();
  });

  describe('constructor()', () => {
    it('should set an initial stack entry', () => {
      const [, entry] = stack.first();

      expect(stack.getAll().size).toBe(1);
      expect(entry.pathname).toBe(pathname1);
    });
  });

  describe('push()', () => {
    it('should resolve correctly', () => {
      const params = {
        to: `${pathname1}?s=phrase#what`,
        meta: {
          test: 123,
        },
      };

      const didCallback = jest.fn();

      listener = router.listen(didCallback);

      return router.push(params).then((result) => {
        expect(router.getCurrentIndex()).toBe(1);

        const [, route] = stack.last();

        expect(route.pathname).toBe(pathname1);
        expect(route.query).toEqual({ s: 'phrase' });
        expect(route.meta).toEqual({ test: 123 });

        expect(didCallback).toHaveBeenCalledWith({
          action: constants.PUSH,
          next: result.next,
          prev: result.prev,
        });

        expect(history.location.pathname).toBe(`${pathname1}?s=phrase#what`);
        expect(history.location.state).toEqual(expect.objectContaining({
          route: {
            id: expect.any(String),
          },
          test: 123,
        }));
      });
    });

    it('should remove all forward routes from the stack', async () => {
      await router.push({ to: '/myroute/456' });
      await router.push({ to: '/myroute/789' });

      expect(stack.getAll().size).toBe(3);

      await router.pop({ steps: 2 });
      await router.push({ to: '/myroute/abc' });

      expect(router.getCurrentIndex()).toBe(1);
      expect(stack.getAll().size).toBe(2);
      expect(stack.getByIndex(1).pathname).toBe('/myroute/abc');
    });

    it('should reject when params are missing', () => (
      router.push().catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSMISSING))
      ))
    ));

    it('should reject when params are empty', () => (
      router.push({}).catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSEMPTY))
      ))
    ));

    it('should not emit push event', () => {
      const params = {
        to: pathname1,
        emit: false,
      };

      const callback = jest.fn();

      listener = router.listen(callback);

      return router.push(params).then(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });

    it('should push when a non-matching pathname was given', (done) => {
      const params = {
        to: '/not-registered',
      };

      return router.push(params).then(async ({ next }) => {
        expect(next.pathname).toBe('/not-registered');

        // Pop to remove the non-matching route for the next set of tests.
        await router.pop();
        done();
      });
    });
  });

  describe('pop()', () => {
    it('should resolve correctly', async (done) => {
      const callback = jest.fn();

      await router.push({ to: '/myroute/456' });

      listener = router.listen(callback);

      router.pop().then((result) => {
        const route = stack.getByIndex(0);

        expect(stack.getAll().size).toBe(2);
        expect(router.getCurrentIndex()).toBe(0);
        expect(route).toEqual(result.next);
        expect(callback).toHaveBeenCalledWith({
          action: constants.POP,
          next: result.next,
          prev: result.prev,
        });
        expect(history.location.pathname).toBe(pathname1);

        done();
      });
    });

    it('should update meta info when popping', async (done) => {
      await router.push({ to: '/myroute/456', meta: { hi: '123' } });
      await router.push({ to: '/myroute/789' });

      router.pop({ meta: { ho: '456' } }).then((result) => {
        expect(result.next.meta).toEqual({
          hi: '123',
          ho: '456',
        });
        done();
      });
    });

    it('should pop multiple routes', async (done) => {
      await router.push({ to: '/myroute/456' });
      await router.push({ to: '/myroute/789' });

      router.pop({ steps: 2 }).then((result) => {
        const currentRoute = stack.getByIndex(router.getCurrentIndex());
        expect(currentRoute).toBe(result.next);
        done();
      });
    });

    it('should not pop when steps is negative', async () => {
      await router.push({ to: '/myroute/456' });
      await router.pop({ steps: -3 }).catch((error) => (
        expect(error).toEqual(new Error(errors.EINVALIDSTEPS))
      ));
    });

    it('should clamp when steps is larger than the stack', async (done) => {
      await router.push({ to: '/myroute/456' });
      await router.push({ to: '/myroute/789' });

      return router.pop({ steps: 5 }).then((result) => {
        expect(result.next).toBe(stack.getByIndex(0));
        done();
      });
    });

    it('should merge given state to incoming route', async (done) => {
      await router.push({
        to: '/myroute/456',
        meta: { hi: 5, ho: 123 },
      });
      await router.push({ to: '/myroute/789' });

      const meta = {
        ho: 456,
      };

      router.pop({ meta }).then(() => {
        const currentRoute = stack.getByIndex(router.getCurrentIndex());
        expect(currentRoute.meta).toEqual({
          hi: 5,
          ho: 456,
        });
        done();
      });
    });

    it('should not emit event', async () => {
      const callback = jest.fn();

      await router.push({ to: '/myroute/456' });

      listener = router.listen(callback);

      return router.pop({ emit: false }).then(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('replace()', () => {
    it('should replace correctly', async () => {
      const callback = jest.fn();
      listener = router.listen(callback);

      const result = await router.replace({
        to: '/myroute/789',
        meta: { test: '123' },
      });

      expect(stack.getAll().size).toBe(1);
      expect(result.prev.pathname).toBe('/myroute/456');
      expect(result.next.pathname).toBe('/myroute/789');
      expect(result.next.meta).toEqual({ test: '123' });
      expect(callback).toHaveBeenCalledWith({
        action: constants.REPLACE,
        next: result.next,
        prev: result.prev,
      });

      expect(history.location.pathname).toBe('/myroute/789');
      expect(history.location.state).toEqual(expect.objectContaining({
        route: {
          id: expect.any(String),
        },
        test: '123',
      }));
    });

    it('should reject when params are missing', () => (
      router.replace().catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSMISSING))
      ))
    ));

    it('should reject when params are empty', () => (
      router.replace({}).catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSEMPTY))
      ))
    ));

    it('should not emit push event', () => {
      const params = {
        to: pathname1,
        emit: false,
      };

      const callback = jest.fn();

      listener = router.listen(callback);

      return router.replace(params).then(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });

    it('should reject when pathname cannot be matched', () => {
      const params = {
        to: pathname1,
      };

      return router.replace(params).catch((error) => (
        expect(error).toEqual(new Error(errors.EINVALIDPATHNAME))
      ));
    });
  });

  describe('reset()', () => {
    it('should correctly reset to the first route', (done) => {
      const [, firstRoute] = stack.first();
      const callback = jest.fn();

      router.push({ to: '/myroute/456' });
      router.push({ to: '/myroute/789' });

      listener = router.listen(callback);

      const prevRoute = stack.getByIndex(router.getCurrentIndex());
      const meta = { reset: true };

      router.reset({ meta }).then((result) => {
        expect(history.location.pathname).toBe(pathname1);
        expect(firstRoute).toBe(result.next);
        expect(result.next.meta).toEqual(meta);
        expect(prevRoute).toBe(result.prev);
        expect(callback).toHaveBeenCalledWith(result);
        done();
      });
    });

    it('should not reset when there is only one route', (done) => {
      const callback = jest.fn();

      listener = router.listen(callback);

      router.reset().catch(() => {
        expect(callback).not.toHaveBeenCalled();
        done();
      });
    });

    it('should correctly reset to the specified route', async (done) => {
      const callback = jest.fn();

      await router.push({ to: '/myroute/456' });

      listener = router.listen(callback);

      router.reset({ to: '/myroute/789' }).then((result) => {
        expect(result.prev.pathname).toBe('/myroute/456');
        expect(result.next.pathname).toBe('/myroute/789');

        expect(stack.getAll().size).toBe(2);
        expect(callback).toHaveBeenCalledWith(result);
        done();
      });
    });
  });

  describe('handleNativeEvent()', () => {
    it('should natively navigate backwards', async (done) => {
      await router.push({ to: '/somewhere' });
      await router.push({ to: '/somewhere/else' });

      history.goBack();

      setTimeout(() => {
        expect(router.getCurrentRoute().pathname).toEqual('/somewhere');
        done();
      }, 500);
    });

    it('should natively navigate forwards', async (done) => {
      const url = '/somewhere?hi=123#what';

      await router.push({ to: url });
      await router.pop();

      history.goForward();

      setTimeout(() => {
        expect(router.getCurrentRoute().location).toEqual(url);
        done();
      }, 500);
    });
  });
});
