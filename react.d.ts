import * as History from 'history';
import * as React from 'react';
import { Route } from './index';

export interface RouteProps {
  children: React.Node,
  path: string,
}

export function Route(props: RouteProps): React.Component<RouteProps>

export interface RouterProps {
  children: React.Node,
  history?: History.History,
}

export function Router(props: RouterProps): React.Component<RouterProps>

export function useHistory(): {
  current: Route | null,
  currentIndex: number,
  previous: Route | null,
}

export function useParams(): {
  [key: string]: any
}

export function useQuery(): {
  [key: string]: any
}

export function useRoute(): Route

export const RouteContext: React.Context<Route>

export const RouterContext: React.Context<{
  prev: string | null,
  next: string | null
}>
