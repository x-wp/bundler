import { Configuration } from 'webpack';
import { WordPack } from '../services';

export async function buildConfig(
  env: Record<string, string>,
): Promise<Configuration[]> {
  return await new WordPack(env).buildConfig();
}
