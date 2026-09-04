import { Schema, model, Document, Types } from "mongoose";
import { IScope, ScopeType } from "../../scope/scope.types";
import { SubjectType } from "../../types/authzRequest.types";

export interface IRoleAssignment extends Document {
  _id: Types.ObjectId;
  subjectId: string;
  subjectType: SubjectType;
  roleId: Types.ObjectId;
  scope: IScope;
  grantedBy: string;
  grantedAt: Date;

  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const scopeSchema = new Schema<IScope>(
  {
    type: {
      type: String,
      enum: Object.values(ScopeType),
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const roleAssignmentSchema = new Schema<IRoleAssignment>(
  {
    subjectId: {
      type: String,
      required: true,
      index: true,
    },
    subjectType: {
      type: String,
      enum: Object.values(SubjectType),
      required: true,
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    scope: {
      type: scopeSchema,
      required: true,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    grantedBy: {
      type: String,
      required: true,
    },

    expiresAt: Date,
  },
  { timestamps: true },
);

roleAssignmentSchema.index( { subjectId: 1, subjectType: 1, roleId: 1, "scope.type": 1,"scope.id": 1,},{ unique: true,});

const RoleAssignmentModel = model<IRoleAssignment>(
  "RoleAssignment",
  roleAssignmentSchema,
);

export default RoleAssignmentModel;
