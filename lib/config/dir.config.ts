import { Allow, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DirMap {
  src: string;
  dist: string;
}

export class PathConfig {
  @Allow()
  root: DirMap | string = { src: 'assets', dist: 'dist' };
  @Allow()
  scripts: DirMap | string = 'scripts';
  @Allow()
  styles: DirMap | string = 'styles';
  @Allow()
  images: DirMap | string = 'images';
  @Allow()
  fonts: DirMap | string = 'fonts';
}
