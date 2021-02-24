import store from './store';

jest.mock('history/browser', () => ({
  location: {
    pathname: '/hello/world',
    search: '?param=123',
    hash: 'title',
    state: null,
    key: 'default'
  }
}))

describe('React - Store', () => {
  beforeAll(() => {
    const { push } = store.getState();
    push({
      pathname: '/second/route',
      search: '',
      hash: '',
      key: '#2'
    });
  });

  it('should correctly create the store with initial history entry', () => {
    expect(store.getState()).toMatchSnapshot();
  });

  it('should allow back', () => {
    const { back } = store.getState();
    store.setState({ current: 2 });
    back();
    expect(store.getState().current).toBe(1);
  });

  it('should not go back past limit', () => {
    const { back } = store.getState();
    store.setState({ current: 0 });
    back();
    expect(store.getState().current).toBe(0);
  });

  it('should allow back', () => {
    const { forward } = store.getState();
    store.setState({ current: 0 });
    forward();
    expect(store.getState().current).toBe(1);
  });
  
  it('should not go forward past limit', () => {
    const { forward } = store.getState();
    store.setState({ current: 1 });
    forward();
    expect(store.getState().current).toBe(1);
  });

  it('should allow push', () => {
    const { push } = store.getState();
    store.setState({ current: 1 });
    push({
      pathname: '/hello/world/again',
      search: '',
      hash: '',
      state: {
        hi: '123',
      },
      key: '#3'
    });
    expect(store.getState()).toMatchSnapshot();
  });

  it('should allow push and remove forward routes', () => {
    const { push } = store.getState();
    store.setState({ current: 0 });
    push({
      pathname: '/hello/world/again',
      search: '',
      hash: '',
      state: {
        hi: '123',
      },
      key: '#3'
    });
    expect(store.getState()).toMatchSnapshot();
  });

  it('should forward instead of push', () => {
    const { push } = store.getState();
    store.setState({ current: 0 });

    push({
      pathname: '/hello/world/again',
      search: '',
      hash: '',
      key: '#3'
    });

    const { current, routes } = store.getState();
    expect(routes[current].state).toEqual({ hi: '123' });
  });
});
