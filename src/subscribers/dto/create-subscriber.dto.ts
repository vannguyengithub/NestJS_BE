import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Skills không được để trống' })
  @IsArray({ message: 'Skills phải là một array' })
  @IsString({
    each: true,
    message: 'skills phải là một string',
  })
  skills: string[];
}
