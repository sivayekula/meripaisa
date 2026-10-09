import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ enum: ['expense', 'income'] })
  @IsIn(['expense', 'income']) type: string;
  @ApiProperty()
  @IsString() category: string;
  @ApiPropertyOptional()
  @IsOptional() @IsString() subcategory?: string;
  @ApiProperty({ minimum: 0.01, example: 250 })
  @Type(() => Number) @IsNumber() @Min(0.01) amount: number;
  @ApiPropertyOptional({ format: 'date-time', description: 'Defaults to the current time' })
  @IsOptional() @IsDateString() date?: string; // defaults to now
  @ApiPropertyOptional()
  @IsOptional() @IsString() description?: string;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional()
  @IsOptional() @IsString() subcategory?: string;
  @ApiPropertyOptional({ minimum: 0.01, example: 250 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.01) amount?: number;
  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional() @IsDateString() date?: string;
  @ApiPropertyOptional()
  @IsOptional() @IsString() description?: string;
}
