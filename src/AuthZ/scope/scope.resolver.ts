import { Request } from "express";
import { IScope, ScopeType } from "./scope.types";


export class ScopeResolver {

    resolve(req: Request): IScope | undefined {
        const organizationId = req.headers['x-organization-id'];

        if(typeof organizationId !== 'string') return undefined;
        if(!organizationId.trim()) return undefined

        return {
            type: ScopeType.ORGANIZATION,
            id: organizationId.trim()
        }
    }

}

