import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: mongoose.Schema.Types.ObjectId;
}
