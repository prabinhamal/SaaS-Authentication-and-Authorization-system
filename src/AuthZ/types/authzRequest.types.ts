import { IScope } from "./scope.types";

export enum SubjectType {
  USER = "user",
  SERVICE = "service",
  APIKEY = "apikey",
}

export enum AuthenticationStrength {
  WEAK = "weak",
  STRONG = "strong",
  MFA = "mfa",
}
export enum RequestOrigin {
  API = "api",
  WEB = "web",
  INTERNAL_SERVICE = "internal-service",
}

export interface AuthZSubject {
  id: string;
  type: SubjectType;
}

export type AuthZAction = string;

export interface AuthZResource {
  id: string;
  type: string;
}

export interface AuthZContext {
  // organizationId?: string;
  scope?: IScope;
  targetScope?: IScope;
  authenticationStrength?: AuthenticationStrength;
  requestOrigin?: RequestOrigin;

  ip?: string;
  time?: string;
  userAgent?: string;
  consistencyToken?: string;
  attributes?: Record<string, unknown>;
}

export interface AuthzRequest {
  subject: AuthZSubject;
  action: AuthZAction;
  resource: AuthZResource;
  context?: AuthZContext;
  correlationId?: string;
}
