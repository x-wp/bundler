import {
  Configuration,
  ExternalItemFunctionData,
  ExternalItemObjectKnown,
  ExternalItemObjectUnknown,
  ExternalItemValue,
} from 'webpack';
import { Transform, Type } from 'class-transformer';
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
import { DirMap, PathConfig } from './dir.config';

type ExternalItem =
  | string
  | RegExp
  | (ExternalItemObjectKnown & ExternalItemObjectUnknown)
  | ((
      data: ExternalItemFunctionData,
      callback: (
        err?: null | Error,
        result?: string | boolean | string[] | { [index: string]: any },
      ) => void,
    ) => void)
  | ((data: ExternalItemFunctionData) => Promise<ExternalItemValue>);

type DirType = keyof DirMap;

export class WordPackConfig extends WordPackEnv {
  @IsString()
  @Transform(({ value }) => value.replace('[ext]', ''))
  filename: string = '[name].[contenthash:6]';

  @IsString()
  manifest: string = 'assets.json';

  @ValidateNested({ each: true })
  @Type(() => BundleConfig)
  bundles!: BundleConfig[];

  @IsNotEmpty()
  externals:
    | string
    | RegExp
    | ExternalItem[]
    | (ExternalItemObjectKnown & ExternalItemObjectUnknown)
    | ((
        data: ExternalItemFunctionData,
        callback: (
          err?: null | Error,
          result?: string | boolean | string[] | { [index: string]: any },
        ) => void,
      ) => void)
    | ((data: ExternalItemFunctionData) => Promise<ExternalItemValue>) = [
    {
      jquery: 'jQuery',
      underscore: '_',
      backbone: 'backbone',
      lodash: '_',
    },
    // function ({ context, request }, callback) {
    //   if (/^lodash/.test(request as string)) {
    //     callback(null, 'window _');
    //     return;
    //   }
    //   callback();
    // },
  ];

  @IsBoolean()
  @IsOptional()
  multimode: boolean = true;

  @IsObject()
  @ValidateNested()
  @Type(() => PathConfig)
  paths: PathConfig = new PathConfig();

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
  globalChunks: string[] = ['awesome-notifications'];

  @IsObject()
  override: Partial<Configuration> = {};

  root(which: DirType): string {
    return this.dir(which, 'root');
  }

  images(which: DirType): string {
    return this.dir(which, 'images');
  }

  scripts(which: DirType): string {
    return this.dir(which, 'scripts');
  }

  styles(which: DirType): string {
    return this.dir(which, 'styles');
  }

  fonts(which: DirType): string {
    return this.dir(which, 'fonts');
  }

  path(which: DirType, dir: keyof PathConfig): string {
    return dir === 'root'
      ? this.resolve(this.dir(which, 'root'))
      : this.resolve(this.dir(which, 'root'), this.dir(which, dir));
  }

  dir(which: DirType, dir: keyof PathConfig): string {
    if (typeof this.paths[dir] === 'string') {
      return this.paths[dir] as string;
    }

    return this.paths[dir][which];
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
}
