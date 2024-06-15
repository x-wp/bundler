import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsHexColor,
  IsInstance,
  IsInt,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import type { Configuration } from 'webpack';

export class BundleConfig {
  @IsString()
  name!: string;

  @IsString({ each: true })
  files!: string[];

  @IsBoolean()
  @IsOptional()
  splitChunks: boolean = false;

  @IsOptional()
  @IsInstance(RegExp)
  @Type(() => RegExp)
  @ValidateIf((o: BundleConfig) => o.splitChunks === true)
  chunkTest: RegExp = /[\\/]node_modules[\\/]/;

  @IsString()
  @ValidateIf((o: BundleConfig) => o.splitChunks === true)
  @IsOptional()
  chunkId: string = 'vendor-[name]';

  @Min(20000)
  @IsPositive()
  @IsInt()
  @IsOptional()
  @ValidateIf((o: BundleConfig) => o.splitChunks === true)
  chunkMinSize: number = 20000;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsObject()
  @IsOptional()
  override: Partial<Configuration> = {};

  hasStyles(): boolean {
    return this.files.some((f) => f.match(/\.s?css$/i));
  }

  hasScripts(): boolean {
    return this.files.some((f) => f.match(/(\.[tj]sx?)$/i));
  }

  get chunkName(): string {
    return this.chunkId.replace('[name]', this.name);
  }
}
