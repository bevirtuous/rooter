import useStore from './store';

function useLocation() {
  const { current, routes } = useStore();

  return routes[current];
}

export default useLocation;
