import { model, Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const fileSchema = new Schema({
  file: String,
  thumb: String,
  type: String,
  size: String,
});

const messageSchema = new Schema({
  dialogueId: Types.ObjectId,
  body: String,
  createdAt: Date,
  from: {
    type: Types.ObjectId,
    ref: "User",
  },
  to: {
    type: Types.ObjectId,
    ref: "User",
  },
  edited: {
    type: Types.ObjectId,
    ref: "User",
  },
  file: [fileSchema],
  read: {
    type: Boolean,
    default: false,
  },
});

messageSchema.plugin(mongoosePaginate);
messageSchema.index({ body: "text" });

export default model("Message", messageSchema);
