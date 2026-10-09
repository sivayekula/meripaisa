import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './category.schema';
import { SEED } from './seed';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(@InjectModel(Category.name) private model: Model<Category>) {}

  async onModuleInit() {
    if ((await this.model.estimatedDocumentCount()) === 0) await this.model.insertMany(SEED);
  }

  list(type?: string) {
    return this.model.find(type ? { type } : {}).sort({ name: 1 });
  }

  async create(type: string, name: string, subcategories: string[] = []) {
    const exists = await this.model.findOne({ type, name: new RegExp(`^${esc(name.trim())}$`, 'i') });
    if (exists) throw new ConflictException('Category already exists');
    return this.model.create({ type, name: name.trim(), subcategories: subcategories.map((s) => s.trim()) });
  }

  async addSub(id: string, name: string) {
    const cat = await this.model.findById(id);
    if (!cat) throw new NotFoundException('Category not found');
    const n = name.trim();
    if (cat.subcategories.some((s) => s.toLowerCase() === n.toLowerCase()))
      throw new ConflictException('Subcategory already exists');
    cat.subcategories.push(n);
    return cat.save();
  }

  /** used by transactions to validate category / subcategory pair */
  async isValid(type: string, category: string, subcategory?: string) {
    const cat = await this.model.findOne({ type, name: category });
    if (!cat) return false;
    return !subcategory || cat.subcategories.includes(subcategory);
  }
}
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
