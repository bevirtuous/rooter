const pathToRegexp = require('path-to-regexp');

function decodeParam(param) {
  try {
    return decodeURIComponent(param);
  } catch (_) {
    throw new Error();
  }
}

function pathMatch(path, customOptions = {}) {
  const options = {
    sensitive: false,
    strict: false,
    end: false,
    ...customOptions,
  };

  const keys = [];
  const regex = pathToRegexp(path, keys, options);

  return (pathname, params = {}) => {
    const match = regex.exec(pathname);
    const nextParams = { ...params };

    if (!match) {
      return false;
    }

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const param = match[i + 1];

      if (param) {
        nextParams[key.name] = decodeParam(param);

        if (key.repeat) {
          nextParams[key.name] = params[key.name].split(key.delimiter);
        }
      }
    }

    return nextParams;
  };
}

export default pathMatch;
