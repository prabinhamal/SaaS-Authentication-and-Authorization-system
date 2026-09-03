import { Types } from "mongoose";


export interface ParentRoleInput {
  childRoleId: string | Types.ObjectId;
  parentRoleId: string | Types.ObjectId;
}

export interface AddParentRoleInput extends ParentRoleInput {}

export interface RemoveParentRoleInput extends ParentRoleInput {}