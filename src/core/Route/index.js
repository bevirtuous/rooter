import queryString from 'query-string';

function Route(options) {
  const { meta = {} } = options;
  const location = options.pathname.trim();
  const id = options.id;

  const splitPath = location.split('#');
  const path = splitPath[0];
  const hash = splitPath[1] || null;
  const { query, url: pathname } = queryString.parseUrl(path);

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
