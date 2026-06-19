import mongoose, {Schema, Document, Model} from "mongoose";
import bcrypt from "bcrypt"

interface IUser extends Document{
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updateAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "book name must be contain at least 3 characters."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required."],
      unique: true,
      lowercase: true,
      index: true
    },
    password:{
      type: String,
      required: [true, "password is required."]

    }  
    },
  { timestamps: true },
);

const UserModel: Model<IUser> = mongoose.model<IUser>("Book", userSchema);


/// hash password using bcrypt. 
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.statics.findByEmail = async function (email: string): Promise<IUser | null>{
  return this.findOne({email})
}
export default UserModel;
