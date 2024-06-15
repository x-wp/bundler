import { Configuration } from 'webpack';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { WordPackEnv } from './wordpack-env';
import { BundleConfig } from './bundle.config';

export class WordPackConfig extends WordPackEnv {
  @IsString()
  @Transform(({ value }) =>
    (value || '[name].[contenthash:6][ext]').replace('[ext]', ''),
  )
  @IsOptional()
  @Expose()
  filename: string;

  @IsString()
  @IsOptional()
  manifest: string = 'assets.json';

  @ValidateNested({ each: true })
  @Type(() => BundleConfig)
  bundles!: BundleConfig[];

  @IsObject()
  @IsOptional()
  @IsOptional()
  externals: Record<string, string> = {
    jquery: 'jQuery',
    underscore: '_',
    backbone: 'backbone',
  };

  @IsBoolean()
  @IsOptional()
  @IsOptional()
  multimode: boolean = true;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  srcBase?: string = 'assets';

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  distBase?: string = 'dist';

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  imageDir?: string = 'images';

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fontDir?: string = 'fonts';

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  jsDir?: string = 'scripts';

  @IsString()
  @IsNotEmpty()
  @IsOptional()
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
  @IsOptional()
  override: Partial<Configuration> = {};

  get srcDir(): string {
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

  get mode(): 'production' | 'development' {
    return this.prod ? 'production' : 'development';
  }

  get asset(): string {
    return this.prod ? this.filename : '[name]';
  }

  get isCI(): boolean {
    return process.env.CI !== undefined;
  }

  get distPath(): string {
    return this.resolve(this.distRoot);
  }
}
