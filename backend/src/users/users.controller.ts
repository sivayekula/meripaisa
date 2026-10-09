import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

class UpdateProfileDto {
  @ApiPropertyOptional({ minLength: 2 })
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional() @IsString() currency?: string;
}
class ChangePasswordDto {
  @ApiProperty({ format: 'password' })
  @IsString() current: string;
  @ApiProperty({ minLength: 6, format: 'password' })
  @IsString() @MinLength(6) next: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @ApiOperation({ summary: 'Get the current user profile' })
  @Get('me') me(@Req() req) { return this.users.me(req.user.userId); }
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @Patch('me') update(@Req() req, @Body() dto: UpdateProfileDto) { return this.users.update(req.user.userId, dto); }
  @ApiOperation({ summary: 'Change the current user password' })
  @ApiBody({ type: ChangePasswordDto })
  @Patch('me/password') pwd(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(req.user.userId, dto.current, dto.next);
  }
}
