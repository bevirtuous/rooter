import Route from '../Route';
import * as errors from './errors';
import emitter from '../emitter';
import history from '../history';
import stack from '../Stack';
import * as constants from '../constants';

function Router() {
  let currentIndex = 0;
  let historyListener;
  let nativeEvent = true;

  function getCurrentIndex() {
    return currentIndex;
  }

  function addInitialRoute() {
    const { hash, pathname, search } = history.location;
    const fullPathname = `${pathname}${search}${hash}`;
    const route = new Route({ pathname: fullPathname });

    stack.add(route.id, route);
  }

  /**
   * @param {Object} params The router action params.
   * @returns {Promise}
   */
  function handlePop(params = {}) {
    return new Promise((resolve, reject) => {
      const {
        emit = true,
        forceNative = false,
        steps = 1,
        meta = null,
      } = params;
      let unlisten = null;

      if (steps <= 0) {
        reject(new Error(errors.EINVALIDSTEPS));
        nativeEvent = true;
        return;
      }

      // Get id of target route.
      const targetIndex = Math.max(currentIndex - steps, 0);
      const prev = stack.getByIndex(currentIndex);
      const next = stack.getByIndex(targetIndex);

      if (meta) {
        next.meta = Object.assign(next.meta, meta);
      }

      const end = { action: constants.POP, prev, next };

      /**
       *
       */
      const callback = () => {
        unlisten();
        currentIndex = targetIndex;

        if (emit) {
          emitter.emit(constants.EVENT, end);
        }

        resolve(end);
        nativeEvent = true;
      };

      /**
       * Create a reference to the history listener
       * to be able to unsubscribe from inside the callback.
       */
      unlisten = history.listen(callback);

      // Perform the history back action.
      if (forceNative || !nativeEvent) {
        history.go(steps * -1);
      } else {
        callback();
      }
    });
  }

  /**
   * @param {Object} params The params to use when navigating.
   * @param {boolean} [cleanStack=true] When true, the overhanging routes will be removed.
   * @param {boolean} [nativePush=false] When true, the process of adding a route to
   * the stack is skipped.
   * @returns {Promise}
   */
  function handlePush(params, cleanStack = true, nativePush = false) {
    return new Promise((resolve, reject) => {
      // Check for missing parameters.
      if (!params) {
        reject(new Error(errors.EPARAMSMISSING));
        nativeEvent = true;
        return;
      }

      // Check for empty params.
      if (Object.keys(params).length === 0) {
        reject(new Error(errors.EPARAMSEMPTY));
        nativeEvent = true;
        return;
      }

      const {
        emit = true,
        meta,
        to,
      } = params;
      let unlisten = null;

      // Remove all unwanted items from the stack.
      if (cleanStack) {
        while (currentIndex < stack.getAll().size - 1) {
          const [id] = stack.last();
          stack.remove(id);
        }
      }

      const prev = stack.getByIndex(currentIndex);
      const next = nativePush ? stack.getByIndex(currentIndex + 1) : new Route({
        pathname: to,
        meta,
      });

      if (!nativePush) {
        // Add item to the stack
        stack.add(next.id, next);
      }

      /**
       * The history event callback.
       */
      const callback = () => {
        // Unsubscribe from the history events.
        unlisten();

        // Increment the route index.
        currentIndex += 1;

        // Emit completion event.
        if (emit) {
          emitter.emit(constants.EVENT, { action: constants.PUSH, prev, next });
        }

        // Resolve the Promise.
        resolve({ prev, next });
        nativeEvent = true;
      };

      /**
       * Create a reference to the history listener
       * to be able to unsubscribe from inside the callback.
       */
      unlisten = history.listen(callback);

      // Perform the history push action.
      if (!nativeEvent) {
        history.push({
          pathname: to,
        }, {
          ...meta,
          route: { id: next.id },
        });
      } else {
        callback();
      }
    });
  }

  const handleReplace = (params) => new Promise((resolve, reject) => {
    // Check for missing parameters.
    if (!params) {
      reject(new Error(errors.EPARAMSMISSING));
      nativeEvent = true;
      return;
    }

    // Check for empty params.
    if (Object.keys(params).length === 0) {
      reject(new Error(errors.EPARAMSEMPTY));
      nativeEvent = true;
      return;
    }

    const {
      emit = true,
      to,
      meta,
    } = params;
    let unlisten = null;

    const { id } = stack.getByIndex(currentIndex);
    const prev = stack.get(id);
    const next = new Route({
      pathname: to,
      meta,
    });
    const end = { action: constants.REPLACE, prev, next };

    // Add item to the stack.
    stack.add(next.id, next);

    // Remove item being replaced.
    stack.remove(id);

    /**
     * The history event callback.
     */
    const callback = () => {
      // Unsubscribe from the history events.
      unlisten();

      // Emit completion event.
      if (emit) {
        emitter.emit(constants.EVENT, end);
      }

      resolve(end);
      nativeEvent = true;
    };

    /**
     * Create a reference to the history listener
     * to be able to unsubscribe from inside the callback.
     */
    unlisten = history.listen(callback);

    // Perform the history replace action.
    if (!nativeEvent) {
      history.replace({
        pathname: to,
      }, {
        ...meta,
        route: { id },
      });
    } else {
      callback();
    }
  });

  /**
   * @param {Object} params The params when routing.
   * @returns {Promise}
   */
  const push = (params) => {
    nativeEvent = false;
    return handlePush(params);
  };

  /**
   * @param {Object} params The params when routing.
   * @returns {Promise}
   */
  const pop = (params) => {
    nativeEvent = false;
    return handlePop(params);
  };

  /**
   * @param {Object} params The params when routing.
   * @returns {Promise}
   */
  const replace = (params) => {
    nativeEvent = false;
    return handleReplace(params);
  };

  /**
   * @param {string} id The route id to update.
   * @param {Object} meta The new meta.
   * @param {boolean} emit When true, will emit when the meta was updated.
   * @returns {Promise}
   */
  const update = (id, meta = {}, emit = true) => new Promise((resolve, reject) => {
    if (!id || Object.keys(meta).length === 0) {
      reject(new Error(errors.EPARAMSINVALID));
      return;
    }

    const route = stack.get(id);

    if (!route) {
      reject(new Error(errors.EINVALIDID));
      return;
    }

    route.meta = Object.assign(route.meta, meta);
    route.updated = Date.now();

    stack.update(id, route);

    if (emit) {
      emitter.emit(constants.EVENT, { action: constants.UPDATE, route });
    }

    resolve(route);
  });

  /**
   * @returns {Promise}
   */
  const reset = ({ to = null, meta = null } = {}) => new Promise((resolve, reject) => {
    if (currentIndex === 0) {
      reject();
      return;
    }

    nativeEvent = false;
    const route = stack.first()[1];

    const prev = stack.getByIndex(currentIndex);
    const next = {
      action: constants.RESET,
      prev,
      next: route,
    };

    if (meta) {
      update(route.id, meta, false);
    }

    const params = {
      emit: false,
      forceNative: true,
      steps: currentIndex,
    };

    handlePop(params)
      .then(() => {
        if (!to) {
          emitter.emit(constants.EVENT, next);
          nativeEvent = true;
          resolve(next);
          return;
        }

        handleReplace({ to, meta, emit: false }).then((replaced) => {
          next.next = replaced.next;

          nativeEvent = true;
          emitter.emit(constants.EVENT, next);
          resolve(next);
        });
      });
  });

  /**
   * @returns {Route}
   */
  const getCurrentRoute = () => stack.getByIndex(currentIndex);

  function handleNativeEvent(location, action) {
    if (!nativeEvent) {
      return;
    }

    const next = stack.getByIndex(currentIndex + 1);

    if (next && location.state && location.state.route && next.id === location.state.route.id) {
      handlePush({
        to: next.location,
        meta: location.state,
      }, false, true);

      return;
    }

    if (action === constants.POP) {
      handlePop();
    }
  }

  function init() {
    currentIndex = 0;
    nativeEvent = true;

    if (typeof historyListener === 'function') {
      historyListener();
      stack.clear();
    }

    addInitialRoute();

    historyListener = history.listen(handleNativeEvent);

    return this;
  }

  return {
    getCurrentIndex,
    getCurrentRoute,
    init,
    pop,
    push,
    replace,
    reset,
    update,
  };
}

export default new Router().init();
