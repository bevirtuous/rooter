import queryString from 'query-string';

function Route(options) {
  const { meta = {} } = options;
  const location = options.pathname.trim();
  const id = Math.random().toString(36).substr(2, 5);

  const splitPath = location.split('#');
  const path = splitPath[0];
  const hash = splitPath[1] || null;
  const { query, url: pathname } = queryString.parseUrl(path);

  const created = Date.now();

  return {
    id,
    hash,
    location,
    meta,
    pathname,
    query,
    created,
  };
}

export default Route;
