import router from '../Router';
import setQuery from '.';

const spy = jest.spyOn(router, 'push');
const { pathname } = router.getCurrentRoute();

describe('setQuery', () => {
  it('should set a query', () => {
    setQuery({ hi: 123 });

    expect(spy).toHaveBeenCalledWith({ to: `${pathname}?hi=123` });
  });

  it('should override a query', () => {
    setQuery({ hi: 456 });

    expect(spy).toHaveBeenCalledWith({ to: `${pathname}?hi=456` });
  });

  it('should merge with existing query', () => {
    setQuery((query) => ({ ...query, ho: 789 }));

    expect(spy).toHaveBeenCalledWith({ to: `${pathname}?hi=456&ho=789` });
  });
});
