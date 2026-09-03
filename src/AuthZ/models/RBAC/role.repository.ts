import { Types } from "mongoose";
import { IRole, RoleModel } from "./role.schema";


export class RoleRepository {

    async create(data: Pick<IRole, "name" | "permissions"> & Partial<IRole>): Promise<IRole>{
        return RoleModel.create(data)
    };

    async findById(id: string | Types.ObjectId): Promise<IRole | null>{
        return RoleModel.findById(id).lean().exec();
    };

    async findByIds(  ids: (string | Types.ObjectId)[]): Promise<IRole[]>{
        return await RoleModel.find({
            _id: {$in: ids}
        }).lean().exec();
    }

    async findByName(name: string): Promise<IRole | null>{
        return RoleModel.findOne({name: name.toLocaleLowerCase()}).lean().exec();
    }

    async findAll(): Promise<IRole[]>{
        return RoleModel.find().lean().exec();
    }

    async updateById(id: string | Types.ObjectId, data: Partial<Pick<IRole, "description" | "permissions">>): Promise<IRole | null>{
        return RoleModel.findByIdAndUpdate(id, data, {returnDocument: "after", runValidators: true,}).lean().exec();
    }

    async updateParentRoles(id: string | Types.ObjectId, parentRoleIds: Types.ObjectId[]): Promise<IRole | null> {
        return RoleModel.findByIdAndUpdate(id, {parentRoleIds}, { returnDocument: "after", runValidators: true}).lean().exec();
    }

    async delete(id: string | Types.ObjectId): Promise<IRole | null>{
        return RoleModel.findByIdAndDelete(id).lean().exec()
    }

}
