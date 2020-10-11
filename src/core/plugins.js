const plugins = [];

export function addPlugin(fn) {
  plugins.push(fn);
}

export function applyPlugins(data) {
  if (plugins.length === 0) {
    return data;
  }

  // Iterate over and call each plugin, passing the initial data.
  // It is important that the accumulated data is merged last
  // so that no plugin can override the work of another.
  return plugins.reduce((acc, plugin) => ({
    ...plugin(data),
    ...acc,
  }), data);
}
