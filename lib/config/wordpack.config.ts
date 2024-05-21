import { BundleConfig } from './bundle.config';
import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Configuration } from 'webpack';

export class WordPackConfig {
  @ValidateNested({ each: true })
  @Type(() => BundleConfig)
  bundles!: BundleConfig[];

  @IsObject()
  @IsOptional()
  externals: Record<string, string> = {
    jquery: 'jQuery',
    underscore: '_',
    backbone: 'backbone',
  };

  @IsBoolean()
  @IsOptional()
  multimode: boolean = true;

  @IsString()
  @IsNotEmpty()
  srcBase?: string = 'assets';

  @IsString()
  @IsNotEmpty()
  distBase?: string = 'dist';

  @IsString()
  @IsNotEmpty()
  imageDir?: string = 'images';

  @IsString()
  @IsNotEmpty()
  fontDir?: string = 'fonts';

  @IsString()
  @IsNotEmpty()
  jsDir?: string = 'scripts';

  @IsString()
  @IsNotEmpty()
  cssDir?: string = 'styles';

  @IsEnum([
    'eval',
    'eval-cheap-source-map',
    'eval-cheap-module-source-map',
    'eval-source-map',
    'cheap-source-map',
    'cheap-module-source-map',
    'source-map',
    false,
  ])
  sourceMaps: string | false = 'eval-cheap-source-map';

  @IsString({ each: true })
  @IsOptional()
  globalChunks: string[] = ['awesome-notifications'];

  @IsObject()
  override: Partial<Configuration> = {};

  get assetRoot(): string {
    return this.srcBase as string;
  }

  get distRoot(): string {
    return this.distBase as string;
  }

  get images(): string {
    return this.imageDir as string;
  }

  get fonts(): string {
    return this.fontDir as string;
  }

  get scripts(): string {
    return this.jsDir as string;
  }

  get styles(): string {
    return this.cssDir as string;
  }
}
