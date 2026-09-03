

import { Schema, model, Document, Types } from "mongoose";


export interface IRole extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    permissions: string[];
    parentRoleIds: Types.ObjectId[],
    isSystemRole: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const roleSchema = new Schema<IRole>({

    name:{
        type: String,
        required: [true, "role name is required."],
        unique: true,
        lowercase: true,
        trim: true

    },

    description: {
        type: String,
        trim: true,
    },
    permissions: {
        type: [String],
        required: [true,"permissions are required."],
        default: [],
    },
    parentRoleIds: {
        type: [Schema.Types.ObjectId],
        ref: "Role",
        default: [],
    },
    isSystemRole: {
        type: Boolean,
        required: true,
        default: false
    }


},{timestamps: true});

export const RoleModel = model<IRole>("Role", roleSchema)
