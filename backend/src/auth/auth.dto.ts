import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ minLength: 2 })
  @IsString() @MinLength(2) name: string;
  @ApiPropertyOptional({ format: 'email' })
  @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ pattern: '^\\+?[0-9]{10,15}$' })
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/, { message: 'Enter a valid phone number' }) phone?: string;
  @ApiProperty({ minLength: 6, format: 'password' })
  @IsString() @MinLength(6) password: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Email address or phone number' })
  @IsString() identifier: string; // email or phone
  @ApiProperty({ format: 'password' })
  @IsString() password: string;
}
