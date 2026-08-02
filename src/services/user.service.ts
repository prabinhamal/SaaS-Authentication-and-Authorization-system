import UserModel from "../models/User.model";
import { IUser } from "../interfaces/user.interface";
import { NotFoundError } from "../utils/AppError";

class UserServices {
  async getUserById(id: string): Promise<IUser> {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async getUserByEmail(email: string): Promise<IUser>{
    const user = await UserModel.findOne({email: email})
     if (!user) throw new NotFoundError("User not found");
     return user;
  }

}
export default new UserServices();
