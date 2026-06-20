import mongoose, {Schema, Model} from "mongoose";

enum Type {
    EMAIL_VERIFICATION= "EMAIL_VERIFICATION",
    PASSWORD_RESET = "PASSWORD_RESET",
    OTP = "OTP"

}

interface TokenVerifaction {
    userId: mongoose.Schema.Types.ObjectId;
    token: string;
    type: Type;
    expiresAt: Date;
    usedAt: Date;
    createdAt: Date;
}

const tokenSchema: Schema<TokenVerifaction> = new Schema<TokenVerifaction>({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "User Id is required"],
    },
    token: {
        type: String,
        required: [true, "Token is required."]
    },
    type: {
        type: String,
        enum: Type,
        required: [true, "Token type is required."]
    },
    expiresAt: {
        type: Date,
        default: ()=>new Date(Date.now() + (15*60*100)),
    },
    usedAt: Date

}, {
    timestamps: true,
})


const TokenModel: Model<TokenVerifaction> = mongoose.model<TokenVerifaction>("Token", tokenSchema)


export default TokenModel;
