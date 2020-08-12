import * as History from 'history';
import * as React from 'react';
import { Route as RouteType, ObjectType } from './index';

export interface RouteProps {
  children: React.ReactNode,
  component: React.ComponentType,
  path: string,
}

export interface RouteTypeExtended extends RouteType {
  params: ObjectType,
  pattern: string;
}

export function Route(props: RouteProps): JSX.Element;

export interface RouterProps {
  children: React.ReactNode,
  history?: History.History,
}

export function Router(props: RouterProps): JSX.Element;

export function useHistory(): {
  current: RouteTypeExtended,
  currentIndex: number,
  previous: RouteTypeExtended | null,
}

export function useParams(): ObjectType

export function useQuery(): ObjectType

export function useRoute(): RouteTypeExtended

export const RouteContext: React.Context<RouteTypeExtended>

export const RouterContext: React.Context<{
  prev: RouteType | null,
  next: RouteType
}>
