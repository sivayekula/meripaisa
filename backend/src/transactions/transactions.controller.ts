import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private svc: TransactionsService) {}

  @ApiOperation({ summary: 'Create an income or expense entry' })
  @ApiBody({ type: CreateTransactionDto })
  @Post() create(@Req() req, @Body() dto: CreateTransactionDto) { return this.svc.create(req.user.userId, dto); }

  @ApiOperation({ summary: 'List transactions in a date range' })
  @ApiQuery({ name: 'type', required: false, enum: ['expense', 'income'] })
  @ApiQuery({ name: 'from', required: false, description: 'ISO 8601 date-time. If both date bounds are omitted, defaults to today.', schema: { type: 'string', format: 'date-time' } })
  @ApiQuery({ name: 'to', required: false, description: 'ISO 8601 date-time. If both date bounds are omitted, defaults to today.', schema: { type: 'string', format: 'date-time' } })
  @Get() list(@Req() req, @Query('type') type?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.list(req.user.userId, type, from, to);
  }

  @ApiOperation({ summary: 'Get income, expense, balance, and category totals' })
  @ApiQuery({ name: 'from', required: false, description: 'ISO 8601 date-time. If both date bounds are omitted, defaults to today.', schema: { type: 'string', format: 'date-time' } })
  @ApiQuery({ name: 'to', required: false, description: 'ISO 8601 date-time. If both date bounds are omitted, defaults to today.', schema: { type: 'string', format: 'date-time' } })
  @Get('summary') summary(@Req() req, @Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.summary(req.user.userId, from, to);
  }

  @ApiOperation({ summary: 'Update a transaction within its edit window' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiBody({ type: UpdateTransactionDto })
  @Patch(':id') update(@Req() req, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.svc.update(req.user.userId, id, dto);
  }

  @ApiOperation({ summary: 'Delete a transaction within its edit window' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @Delete(':id') remove(@Req() req, @Param('id') id: string) { return this.svc.remove(req.user.userId, id); }
}
