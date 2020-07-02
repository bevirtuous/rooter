const pathToRegexp = require('path-to-regexp');

function decodeParam(param) {
  try {
    return decodeURIComponent(param);
  } catch (_) {
    throw new Error();
  }
}

function pathMatch(options = {}) {
  return (path) => {
    const keys = [];
    const regex = pathToRegexp(path, keys, options);

    return (pathname, params = {}) => {
      const match = regex.exec(pathname);
      const nextParams = { ...params };

      if (!match) {
        return false;
      }

      let key;
      let param;

      for (let i = 0; i < keys.length; i += 1) {
        key = keys[i];
        param = match[i + 1];

        if (param) {
          nextParams[key.name] = decodeParam(param);

          if (key.repeat) {
            nextParams[key.name] = params[key.name].split(key.delimiter);
          }
        }
      }

      return nextParams;
    };
  };
}

export default pathMatch({
  sensitive: false,
  strict: false,
  end: true,
});
