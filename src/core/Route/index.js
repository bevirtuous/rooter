import { parseUrl } from 'query-string';

const parseOptions = {
  arrayFormat: 'comma',
  parseBooleans: true,
  parseNumbers: true,
};

function Route(options) {
  const { meta = {} } = options;
  const location = options.pathname.trim();
  const id = options.id;

  const splitPath = location.split('#');
  const path = splitPath[0];
  const hash = splitPath[1] || null;
  const { query, url: pathname } = parseUrl(path, parseOptions);

  return {
    id,
    hash,
    location,
    meta,
    pathname,
    query,
  };
}

export default Route;
