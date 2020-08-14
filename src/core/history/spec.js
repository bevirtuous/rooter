import history from '.';

describe('history', () => {
  it('should be a `createBrowserHistory` instance', () => {
    expect(history).toMatchSnapshot();
  });
});
