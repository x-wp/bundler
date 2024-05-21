import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import path from 'node:path';

export class WordPackEnv {
  @Expose()
  @IsString()
  @Transform(({ value }) => path.posix.resolve(process.cwd(), value || ''))
  basePath!: string;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value || false)
  production: boolean = false;

  @IsBoolean()
  @Expose()
  @Transform(({ value, obj }) => obj.WEBPACK_WATCH || value || false)
  watch: boolean = false;

  @IsBoolean()
  @IsOptional()
  WEBPACK_WATCH?: boolean;
}
