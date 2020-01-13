import { Observable } from 'rxjs';
import emitter from '../core/emitter';
import { EVENT } from '../core/constants';

const history$ = Observable.create((observer) => {
  emitter.addListener(EVENT, (params) => observer.next(params));
});

export { history$ };
