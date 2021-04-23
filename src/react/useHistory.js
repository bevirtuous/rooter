import history from 'history/browser';

function useHistory() {
  return {
    back: history.back,
    push: history.push,
  };
}

export default useHistory;
