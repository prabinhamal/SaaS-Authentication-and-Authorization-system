

export enum ScopeType {
  ORGANIZATION = "organization",
  PROJECT = "project",
  RESOURCE = "resource",
}


export interface IScope {
    type: ScopeType;
    id: string;
}

