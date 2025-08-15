import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDTO {
  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 6,
  })
  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  refreshToken: string;
}
