import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserDTO {
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email: string;

  @IsStrongPassword(
    { minLength: 6 },
    { message: i18nValidationMessage('validation.isStrongPassword') },
  )
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  refreshToken: string;
}
