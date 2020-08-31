import { stringify } from 'query-string';
import router from '../Router';

function setQuery(input) {
  const { pathname, query } = router.getCurrentRoute();

  // If the input is a function then we want to
  // call it and pass the current query.
  const pairs = (typeof input === 'function') ? input(query) : input;
  const newQuery = stringify(pairs);

  return router.push({ to: `${pathname}?${newQuery}` });
}

export default setQuery;
