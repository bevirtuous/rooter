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
  query: Query;
  created: number;
  updated: number;
}

interface RouterHistory {
  back(params: Params): Promise<{ action: 'POP', prev: Route, next: Route }>,
  current(): Route,
  listen(): Function<{ action: string, prev: Route, next:Route }>,
  go(params: Params): Promise<{ prev: Route, next: Route }>,
  pop(params: Params): Promise<{ action: 'POP', prev: Route, next: Route }>,
  push(params: Params): Promise<{ prev: Route, next: Route }>,
  replace(params: Params): Promise<{ action: 'REPLACE', prev: Route, next: Route }>,
  reset(params: Params): Promise<Route>,
  setMeta(id: string, meta?: ObjectType, emit?: boolean): Promise<Route>,
  setQuery(input: Query): Promise<{ prev: Route, next: Route }>
}

export const history: RouterHistory;

export const PUSH: 'PUSH';
export const POP: 'POP';
export const REPLACE: 'REPLACE';
export const RESET: 'RESET';
export const UPDATE: 'UPDATE';
