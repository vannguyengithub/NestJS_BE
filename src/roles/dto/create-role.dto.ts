import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'IsActive không được để trống' })
  @IsBoolean({ message: 'IsActive phải là một boolean' })
  isActive: boolean;

  @IsNotEmpty({ message: 'Permissions không được để trống' })
  @IsArray({ message: 'Permissions phải là một array' })
  @IsMongoId({ each: true, message: 'Permissions phải là một mongo id' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
