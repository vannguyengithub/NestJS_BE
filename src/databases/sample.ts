import mongoose from 'mongoose';

export const ADMIN_ROLE = 'SUPER_ADMIN';
export const USER_ROLE = 'NORMAL_USER';

export const INIT_PERMISSIONS = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Get company with paginate',
    apiPath: '/api/v1/companies',
    method: 'GET',
    module: 'COMPANIES',
    createdBy: {
      _id: new mongoose.Types.ObjectId(),
      email: 'superadmin@gmail.com',
    },
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
    updatedBy: {
      _id: new mongoose.Types.ObjectId(),
      email: 'superadmin@gmail.com',
    },
    deletedBy: {
      _id: new mongoose.Types.ObjectId(),
      email: 'superadmin@gmail.com',
    },
  },
];
