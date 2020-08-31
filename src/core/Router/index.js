import Route from '../Route';
import history from '../history';
import stack from '../Stack';
import * as constants from '../constants';

function normaliseParams(params) {
  return typeof params === 'string' ? { to: params } : params;
}

function Router() {
  let currentIndex = 0;
  let nativeEvent = true;
  let historyListener;
  const listeners = [];

  function addListener(func) {
    const length = listeners.push(func);

    return () => listeners.splice(length - 1, 1);
  }

  function updateListeners(params) {
    listeners.forEach((func) => func(params));
  }

  function addInitialRoute() {
    const { hash, key, pathname, search } = history.location;
    const location = `${pathname}${search}${hash}`;
    const id = key || 'default';
    const route = new Route({ id, pathname: location });

    stack.add(id, route);
  }

  /**
   * @param {Object} params The router action params.
   * @returns {Promise}
   */
  function handlePop(params = {}) {
    return new Promise((resolve) => {
      const {
        emit = true,
        forceNative = false,
        steps = 1,
        meta = null,
      } = params;
      let unlisten = null;

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
          updateListeners(end);
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
    return new Promise((resolve) => {
      const { emit = true, meta, to } = params;
      let unlisten = null;

      // Remove all unwanted items from the stack.
      if (cleanStack) {
        while (currentIndex < stack.getAll().size - 1) {
          const [id] = stack.last();
          stack.remove(id);
        }
      }

      /**
       * The history event callback.
       * @param {Object} location The current history location.
       */
      const callback = (location) => {
        // Unsubscribe from the history events.
        unlisten();

        const prev = stack.getByIndex(currentIndex);
        const next = nativePush ? stack.getByIndex(currentIndex + 1) : new Route({
          id: location.key,
          meta,
          pathname: to,
        });

        if (!nativePush) {
        // Add item to the stack
          stack.add(location.key, next);
        }

        // Increment the route index.
        currentIndex += 1;

        // Emit completion event.
        if (emit) {
          updateListeners({ action: constants.PUSH, prev, next });
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
        history.push({ pathname: to }, meta);
      } else {
        callback(history.location);
      }
    });
  }

  const handleReplace = (params) => new Promise((resolve) => {
    const {
      emit = true,
      to,
      meta,
    } = params;
    let unlisten = null;

    const { id } = stack.getByIndex(currentIndex);
    const prev = stack.get(id);

    // Remove item being replaced.
    stack.remove(id);

    /**
     * The history event callback.
     * @param {Object} location The current hstory location;
     */
    const callback = (location) => {
      // Unsubscribe from the history events.
      unlisten();

      const next = new Route({
        id: location.key,
        meta,
        pathname: to,
      });
      const end = { action: constants.REPLACE, prev, next };

      stack.add(location.key, next);

      // Emit completion event.
      if (emit) {
        updateListeners(end);
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
      history.replace({ pathname: to }, meta);
    } else {
      callback(history.location);
    }
  });

  /**
   * @param {Object} params The params when routing.
   * @returns {Promise}
   */
  const push = (params) => {
    const nextParams = normaliseParams(params);
    nativeEvent = false;

    return handlePush(nextParams);
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
    const nextParams = normaliseParams(params);
    nativeEvent = false;

    return handleReplace(nextParams);
  };

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
      route.meta = Object.assign(route.meta, meta);
      stack.update(route.id, route);
    }

    const params = {
      emit: false,
      forceNative: true,
      steps: currentIndex,
    };

    handlePop(params)
      .then(() => {
        if (!to) {
          updateListeners(next);
          resolve(next);
        } else {
          handleReplace({ to, meta, emit: false }).then((replaced) => {
            next.next = replaced.next;
            updateListeners(next);
            resolve(next);
          });
        }

        nativeEvent = true;
      });
  });

  function handleNativeEvent(location, action) {
    if (!nativeEvent) {
      return;
    }

    const next = stack.getByIndex(currentIndex + 1);

    if (next && next.id === location.key) {
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
    getCurrentIndex: () => currentIndex,
    getCurrentRoute: () => stack.getByIndex(currentIndex),
    getListenerCount: () => listeners.length,
    init,
    listen: addListener,
    pop,
    push,
    replace,
    reset,
  };
}

export default new Router().init();
