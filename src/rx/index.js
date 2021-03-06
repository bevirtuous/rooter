import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import router from '../core/Router';
import { PUSH, POP, REPLACE, RESET } from '../core/constants';

export const history$ = Observable.create((observer) => {
  router.listen((params) => observer.next(params));
});

export const push$ = history$.pipe(
  filter(({ action }) => action === PUSH)
);

export const pop$ = history$.pipe(
  filter(({ action }) => action === POP)
);

export const replace$ = history$.pipe(
  filter(({ action }) => action === REPLACE)
);

export const reset$ = history$.pipe(
  filter(({ action }) => action === RESET)
);
