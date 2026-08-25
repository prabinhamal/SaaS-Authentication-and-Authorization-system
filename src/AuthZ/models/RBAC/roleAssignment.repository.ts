import { Types } from "mongoose";
import { SubjectType } from "../../types/authzRequest.types";
import RoleAssignmentModel, { IRoleAssignment } from "./roleAssignment.schema";
import { IScope } from "../../types/scope.types";



export class RoleAssignmentRepository {

  async create(data: Pick<IRoleAssignment, "subjectId" | "subjectType" | "roleId" | "scope" | "grantedBy"> & Partial<IRoleAssignment>): Promise<IRoleAssignment> {
    return RoleAssignmentModel.create(data);
  }

  async findBySubject(subjectId: string, subjectType: SubjectType): Promise<IRoleAssignment[]>{
    return RoleAssignmentModel.find({subjectId, subjectType}).lean().exec();
  }

  async findById(id: string | Types.ObjectId): Promise<IRoleAssignment | null>{
    return RoleAssignmentModel.findById(id).lean().exec();
  }
  
  async findActiveBySubjectAndScope(subjectId: string, subjectType: SubjectType, scope: IScope): Promise<IRoleAssignment[]>{
    return RoleAssignmentModel.find({
        subjectId,
        subjectType,
        "scope.type": scope.type,
        "scope.id": scope.id,
        $or: [{expiresAt: {$exists: false}}, {expiresAt: {$gt: new Date()}}]
    }).lean().exec();
  }

  async updateById(id: string | Types.ObjectId, data: Partial<Pick< IRoleAssignment, "scope" | "expiresAt" >>): Promise<IRoleAssignment | null> {
    return RoleAssignmentModel.findByIdAndUpdate(
        id,
        data,
        {
            // new: true,
            returnDocument: "after",
            runValidators: true,
        }
    ).lean().exec();
  }

  async revoke(id: string | Types.ObjectId): Promise<IRoleAssignment | null>{
    return RoleAssignmentModel.findByIdAndDelete(id).lean().exec();
  }

}

