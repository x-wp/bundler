import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsHexColor,
  IsInstance,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import type { Configuration } from 'webpack';

export class BundleConfig {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsString({ each: true })
  files!: string[];

  @IsBoolean()
  splitChunks: boolean = false;

  @IsOptional()
  @IsInstance(RegExp)
  @Type(() => RegExp)
  @ValidateIf((o: BundleConfig) => o.splitChunks === true)
  chunkTest: RegExp = /[\\/]node_modules[\\/]/;

  @ValidateIf((o: BundleConfig) => o.splitChunks === true)
  @Transform(
    ({ value, obj }) => (value || 'vendor-[name]').replace('[name]', obj.name),
    { toClassOnly: true },
  )
  @Expose()
  chunkName?: string;

  @Min(20000)
  @IsPositive()
  @IsInt()
  @ValidateIf((o: BundleConfig) => o.splitChunks === true)
  @IsOptional()
  chunkMinSize?: number;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsObject()
  override: Partial<Configuration> = {};
}
