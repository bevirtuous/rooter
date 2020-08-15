![alt text](https://badgen.net/npm/v/rooter "Latest version")
![alt text](https://badgen.net/travis/bevirtuous/rooter "Build status")
![alt text](https://badgen.net/coveralls/c/github/bevirtuous/rooter "Code coverage")
![alt text](https://badgen.net/npm/license/rooter "MIT License")

### Rooter is a modern client-side router that gives you the essential building blocks to create scalable applications with confidence. With first-class support for React and RxJS, getting started is quick and easy.

---

### Getting Started

`npm install rooter`

#### React

```jsx
import { Router, Route } from 'rooter/react';

<Router>
  <Route path="/">
    ...
  </Route>
  <Route path="/products">
     ...
    <Route path="/:productId">
      ...
    </Route>
  </Route>
  <Route path="/cart">
    ...
  </Route>
</Router>
```

There are also a number of hooks available to access router information inside of your components. More details and examples can be found in the [React section of the docs]().

---

#### RxJS

The `rooter/rx` directory will allow you to import any of the 5 predefined Observables: `history$`, `push$`, `pop$`, `replace$` and `reset$`. More info can be found in the [RxJS section of the docs]().

> Note: You do not need to install RxJS yourself to make use of these Observables.

```js
import { history$ } from 'rooter/rx';

history$.subscribe(({ action, prev, next }) => {
  if (next.pathname === '/logout') {
    // Side effect
  }
});
```

Since we are using Observables here you can apply any RxJS operators to create derived Observables.

```js
import { history$ } from 'rooter/rx';
import { filter } from 'rxjs/operators';

const logout$ = history$.pipe(
  filter(({ next }) => next.pathname === '/logout')
);

logout$.subscribe(() => {
  // Side effect
});
```