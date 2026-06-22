import mongoose, {Schema, Model, Types} from "mongoose";

export enum TokenOtpType {
    EMAIL_VERIFICATION= "EMAIL_VERIFICATION",
    PASSWORD_RESET = "PASSWORD_RESET",
    OTP = "OTP"

}

interface TokenVerifaction {
    userId: Types.ObjectId;
    token: string;
    type: TokenOtpType;
    expiresAt: Date;
    usedAt: Date;
    used: boolean,
    createdAt: Date;
}

const tokenSchema: Schema<TokenVerifaction> = new mongoose.Schema<TokenVerifaction>({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "User Id is required"],
        ref: "User"
    },
    token: {
        type: String,
        required: [true, "Token is required."]
    },
    type: {
        type: String,
        enum: TokenOtpType,
        required: [true, "Token type is required."]
    },
    expiresAt: {
        type: Date,
        default: ()=> new Date(Date.now() + (15*60*100)),
    },
    used:{
        type: Boolean,
        default: false,
    },
    usedAt: Date

}, {
    timestamps: true,
})


const TokenModel: Model<TokenVerifaction> = mongoose.model<TokenVerifaction>("Token", tokenSchema)


export default TokenModel;
