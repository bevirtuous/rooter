import { useContext } from 'react';
import context from './context';
import usePath from './usePath';

function useParams() {
  const { pattern } = useContext(context);
  const { params } = usePath(pattern);

  return params;
}

export default useParams;
