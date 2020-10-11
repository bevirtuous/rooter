import * as plugins from './plugins';

describe('Plugins', () => {
  it('should correctly bail when no plugins have been added', () => {
    const data = { hi: 5 };

    expect(plugins.applyPlugins(data)).toBe(data);
  });

  it('should correctly apply plugins', () => {
    const data = { foo: 1 };
    const plugin1 = () => ({ foo: 4 }); // Here we try to override an existing key.
    const plugin2 = () => ({ bar: 2 });

    plugins.addPlugin(plugin1);
    plugins.addPlugin(plugin2);

    expect(plugins.applyPlugins(data)).toEqual({
      foo: 1,
      bar: 2,
    });
  });
});
