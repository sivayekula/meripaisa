import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService, publicUser } from '../users/users.service';
import { LoginDto, SignupDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  private token(id: string) { return this.jwt.sign({ sub: id }); }

  async signup(dto: SignupDto) {
    if (!dto.email && !dto.phone) throw new BadRequestException('Provide an email or a phone number');
    for (const id of [dto.email, dto.phone].filter(Boolean)) {
      if (await this.users.findByIdentifier(id)) throw new ConflictException('Account already exists');
    }
    const user = await this.users.create({
      name: dto.name,
      email: dto.email || undefined,
      phone: dto.phone || undefined,
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    return { token: this.token(user.id), user: publicUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByIdentifier(dto.identifier);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');
    return { token: this.token(user.id), user: publicUser(user) };
  }
}
