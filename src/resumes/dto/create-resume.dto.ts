import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'UserId không được để trống' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Url không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'Status không được để trống' })
  status: string;

  @IsNotEmpty({ message: 'CompanyId không được để trống' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'JobId không được để trống' })
  jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCvDto {
  @IsNotEmpty({ message: 'Url không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'CompanyId không được để trống' })
  @IsMongoId({ message: 'CompanyId không hợp lệ' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'JobId không được để trống' })
  @IsMongoId({ message: 'JobId không hợp lệ' })
  jobId: mongoose.Schema.Types.ObjectId;
}
