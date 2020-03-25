import * as Events from 'events';

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
  setMeta(id: string, meta?: ObjectType, emit?: boolean): Promise<Route>,
  setQuery(input: Query): Promise<{ prev: Route, next: Route }>
}

export const history: RouterHistory;

export function register(pattern: string): void;

export const EVENT: 'rooter';
export const PUSH: 'PUSH';
export const POP: typeof 'POP';
export const REPLACE: typeof 'REPLACE';
export const RESET: typeof 'RESET';
export const UPDATE: typeof 'UPDATE';

export const emitter: Events.EventEmitter;
