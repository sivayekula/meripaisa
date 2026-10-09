import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';

class CreateCategoryDto {
  @ApiProperty({ enum: ['expense', 'income'] })
  @IsIn(['expense', 'income']) type: string;
  @ApiProperty({ minLength: 2 })
  @IsString() @MinLength(2) name: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) subcategories?: string[];
}
class AddSubDto {
  @ApiProperty({ minLength: 2 })
  @IsString() @MinLength(2) name: string;
}

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private svc: CategoriesService) {}
  @ApiOperation({ summary: 'List categories' })
  @ApiQuery({ name: 'type', required: false, enum: ['expense', 'income'] })
  @Get() list(@Query('type') type?: string) { return this.svc.list(type); }
  @ApiOperation({ summary: 'Create a category' })
  @ApiBody({ type: CreateCategoryDto })
  @Post() create(@Body() d: CreateCategoryDto) { return this.svc.create(d.type, d.name, d.subcategories); }
  @ApiOperation({ summary: 'Add a subcategory' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: AddSubDto })
  @Post(':id/subcategories') addSub(@Param('id') id: string, @Body() d: AddSubDto) { return this.svc.addSub(id, d.name); }
}
