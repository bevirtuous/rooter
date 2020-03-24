import * as Events from 'events';
import * as Core from './dist/core';

export type Url = string;

export type ObjectType = {
  [key: string]: any,
}

export interface Params {
  to: Url;
  meta?: ObjectType | null;
  emit?: boolean;
  steps?: number;
}

export type Query = ObjectType;

export interface Route {
  id: string;
  hash: string;
  location: string;
  meta?: ObjectType | null;
  pathname: string;
  pattern: string;
  params: ObjectType;
  query: Query;
  created: number;
  updated: number;
}

interface RouterHistory {
  back(params: Params): Promise<{ action: 'POP', prev: Route, next: Route }>,
  current(): Route,
  go(params: Params): Promise<{ prev: Route, next: Route }>,
  pop(params: Params): Promise<{ action: 'POP', prev: Route, next: Route }>,
  push(params: Params): Promise<{ prev: Route, next: Route }>,
  replace(params: Params): Promise<{ action: 'REPLACE', prev: Route, next: Route }>,
  reset(params: Params): Promise<Route>,
  setMeta(id: string, meta?: Meta, emit?: boolean): Promise<Route>,
  setQuery(input: Query): Promise<{ prev: Route, next: Route }>
}

export const history: RouterHistory;

export function register(pattern: string): void;

export const EVENT: typeof Core.EVENT;
export const PUSH: typeof Core.PUSH;
export const POP: typeof Core.POP;
export const REPLACE: typeof Core.REPLACE;
export const RESET: typeof Core.RESET;
export const UPDATE: typeof Core.UPDATE;

export const emitter: Events.EventEmitter;
