function Route(options) {
  const { meta = {} } = options;
  const location = options.pathname.trim();
  const id = options.id;
  const splitPath = location.split('#');
  const pathname = splitPath[0].split('?')[0];
  const hash = splitPath[1] || null;

  return {
    id,
    hash,
    location,
    meta,
    pathname,
  };
}

export default Route;
