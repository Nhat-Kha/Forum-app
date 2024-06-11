import { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const banSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
  },
  admin: {
    type: Types.ObjectId,
    ref: "User",
  },
  reason: String,
  body: String,
  createAt: Date,
  ExpiresAt: Date,
});

banSchema.plugin(mongoosePaginate);

export default banSchema("Ban", banSchema);
