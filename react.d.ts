import * as History from 'history';
import * as React from 'react';
import { Route as RouteType, ObjectType } from './index';

export interface RouteProps {
  children: React.ReactNode,
  component: React.ComponentType,
  path: string,
}

export function Route(props: RouteProps): JSX.Element;

export interface RouterProps {
  children: React.ReactNode,
  history?: History.History,
}

export function Router(props: RouterProps): JSX.Element;

export function useHistory(): {
  current: RouteType,
  currentIndex: number,
  previous: RouteType | null,
}

export function useParams(): ObjectType

export function useQuery(): ObjectType

export function useRoute(): RouteType

export const RouteContext: React.Context<RouteType>

export const RouterContext: React.Context<{
  prev: string | null,
  next: string | null
}>
