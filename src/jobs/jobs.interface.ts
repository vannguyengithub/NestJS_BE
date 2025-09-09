export interface IJob {
  _id: string;
  name: string;
  skills: string[];
  company: string;
  location: string;
  salary: number;
  quantity: number;
  level: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: string;
  isDeleted: boolean;
  deletedAt: boolean | null;
  createdAt: string;
  updatedAt: string;
}
