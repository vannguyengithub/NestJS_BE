// import mongoose from 'mongoose';

export interface IPermission {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  company?: {
    _id: string;
    name: string;
  };
  permissions: IPermission[];
}
