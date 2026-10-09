import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @ApiOperation({ summary: 'Create an account' })
  @ApiBody({ type: SignupDto })
  @Post('signup') signup(@Body() dto: SignupDto) { return this.auth.signup(dto); }
  @ApiOperation({ summary: 'Log in with email or phone' })
  @ApiBody({ type: LoginDto })
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); }
}
