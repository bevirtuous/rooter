import { parseUrl } from 'query-string';

function queryStringPlugin(options) {
  return (route) => parseUrl(route.location, options).query;
}

export default queryStringPlugin;
