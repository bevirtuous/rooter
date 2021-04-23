import { parseUrl } from 'query-string';

function parseSearchParams(location, options) {
  return parseUrl(location, options).query;
}

export default parseSearchParams;
