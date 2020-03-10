import * as Events from 'events';
import * as QueryString from 'query-string';
import * as Core from './dist/core';

type Url = string;

interface Meta {
  [key: string]: any
}

interface Params {
  to: Url,
  meta?: Meta | null,
  emit?: boolean,
  forceNative?: boolean,
  steps?: number,
}

interface Query {
  [key: string]: any
}

interface Route {
  id: string,
  hash: string,
  location: string,
  meta?: Meta | null,
  pathname: string,
  pattern: string,
  params: { [key: string]: any },
  query: Query,
  created: number,
  updated: number,
  setPattern: (pattern: string) => void,
}

export interface history {
  back(params: Params): Promise<{ action: 'POP', prev: Route, next: Route }>,
  current(): Route,
  push(params: Params): Promise<{ prev: Route, next: Route }>,
  go(params: Params): Promise<{ prev: Route, next: Route }>,
  pop(params: Params): Promise<{ action: 'POP', prev: Route, next: Route }>,
  replace(params: Params): Promise<{ action: 'REPLACE', prev: Route, next: Route }>,
  reset(params: Params): Promise<Route>,
  setMeta(id: string, meta?: Meta, emit?: boolean): Promise<Route>,
  setQuery(input: Query): Promise<{ prev: Route, next: Route }>
}

export function register(pattern: string): void;

export const EVENT: typeof Core.EVENT;
export const PUSH: typeof Core.PUSH;
export const POP: typeof Core.POP;
export const REPLACE: typeof Core.REPLACE;
export const RESET: typeof Core.RESET;
export const UPDATE: typeof Core.UPDATE;

export const emitter: Events.EventEmitter;
