import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { Transaction, TransactionDocument } from './transaction.schema';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';

const EDIT_WINDOW_MS = 5 * 24 * 60 * 60 * 1000; // 5 days from creation

function todayRange() {
  const now = new Date();
  const from = new Date(now);
  const to = new Date(now);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private model: Model<Transaction>,
    private categories: CategoriesService,
  ) {}

  private view(t: TransactionDocument) {
    const editableUntil = new Date(t.createdAt.getTime() + EDIT_WINDOW_MS);
    return {
      id: t._id.toString(), type: t.type, category: t.category, subcategory: t.subcategory,
      amount: t.amount, date: t.date, description: t.description,
      createdAt: t.createdAt, editableUntil, editable: editableUntil.getTime() > Date.now(),
    };
  }

  private async owned(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    const t = (await this.model.findOne({ _id: id, userId })) as TransactionDocument;
    if (!t) throw new NotFoundException('Entry not found');
    return t;
  }

  private assertEditable(t: TransactionDocument) {
    if (Date.now() - t.createdAt.getTime() > EDIT_WINDOW_MS)
      throw new ForbiddenException('Entries can only be changed within 5 days of creation');
  }

  async create(userId: string, dto: CreateTransactionDto) {
    if (!(await this.categories.isValid(dto.type, dto.category, dto.subcategory)))
      throw new BadRequestException('Unknown category or subcategory');
    const t = await this.model.create({
      ...dto, userId: new Types.ObjectId(userId), date: dto.date ? new Date(dto.date) : new Date(),
    });
    return this.view(t as TransactionDocument);
  }

  async list(userId: string, type: string | undefined, from?: string, to?: string) {
    const q: any = { userId: new Types.ObjectId(userId) };
    if (type) q.type = type;
    const range = from || to ? { from: from && new Date(from), to: to && new Date(to) } : todayRange();
    q.date = { ...(range.from && { $gte: range.from }), ...(range.to && { $lte: range.to }) };
    const rows = (await this.model.find(q).sort({ date: -1, createdAt: -1 }).limit(500)) as TransactionDocument[];
    return rows.map((r) => this.view(r));
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const t = await this.owned(userId, id);
    this.assertEditable(t);
    const category = dto.category ?? t.category;
    const subcategory = dto.category && dto.subcategory === undefined ? undefined : dto.subcategory ?? t.subcategory;
    if (!(await this.categories.isValid(t.type, category, subcategory)))
      throw new BadRequestException('Unknown category or subcategory');
    t.category = category;
    t.subcategory = subcategory;
    if (dto.amount !== undefined) t.amount = dto.amount;
    if (dto.date) t.date = new Date(dto.date);
    if (dto.description !== undefined) t.description = dto.description;
    await t.save();
    return this.view(t);
  }

  async remove(userId: string, id: string) {
    const t = await this.owned(userId, id);
    this.assertEditable(t);
    await t.deleteOne();
    return { ok: true };
  }

  async summary(userId: string, from?: string, to?: string) {
    const match: any = { userId: new Types.ObjectId(userId) };
    const range = from || to ? { from: from && new Date(from), to: to && new Date(to) } : todayRange();
    match.date = { ...(range.from && { $gte: range.from }), ...(range.to && { $lte: range.to }) };

    const [totals, byCategory] = await Promise.all([
      this.model.aggregate([{ $match: match }, { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      this.model.aggregate([
        { $match: match },
        { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
    ]);
    const pick = (t: string) => totals.find((x) => x._id === t) || { total: 0, count: 0 };
    const expense = pick('expense').total;
    const income = pick('income').total;
    return {
      expense, income, balance: income - expense,
      expenseCount: pick('expense').count, incomeCount: pick('income').count,
      byCategory: byCategory.map((x) => ({ type: x._id.type, category: x._id.category, total: x.total })),
    };
  }
}
