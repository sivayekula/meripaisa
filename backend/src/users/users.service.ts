import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';

export const publicUser = (u: UserDocument) => ({
  id: u._id.toString(), name: u.name, email: u.email, phone: u.phone, currency: u.currency,
});

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<User>) {}

  create(data: Partial<User>) { return this.model.create(data); }

  findByIdentifier(identifier: string) {
    const id = identifier.trim();
    return this.model.findOne(id.includes('@') ? { email: id.toLowerCase() } : { phone: id });
  }

  async me(id: string) {
    const u = await this.model.findById(id);
    if (!u) throw new NotFoundException();
    return publicUser(u);
  }

  async update(id: string, patch: { name?: string; currency?: string }) {
    const u = await this.model.findByIdAndUpdate(id, patch, { new: true });
    if (!u) throw new NotFoundException();
    return publicUser(u);
  }

  async changePassword(id: string, current: string, next: string) {
    const u = await this.model.findById(id);
    if (!u || !(await bcrypt.compare(current, u.passwordHash)))
      throw new BadRequestException('Current password is incorrect');
    u.passwordHash = await bcrypt.hash(next, 10);
    await u.save();
    return { ok: true };
  }
}
