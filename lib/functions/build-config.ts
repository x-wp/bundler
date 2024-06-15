import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import * as fs from 'fs-extra';
import * as Svc from '../services';
import { WordPackEnv } from '../config';

export async function buildConfig(
  webpackEnv: Record<string, string> | WordPackEnv,
  wpwpConfig: string = 'wpwp.config.ts',
): Promise<Configuration[]> {
  try {
    const res: Configuration[] = [];
    const env = Svc.UserConfig.env(webpackEnv);
    const cfg = await Svc.UserConfig.load(wpwpConfig, env);

    cfg.bundles.forEach((bundle) =>
      res.push(
        merge(
          Svc.SharedConfig.build(cfg),
          Svc.ManifestConfig.build(cfg),
          Svc.EntryConfig.build(cfg, bundle),
          Svc.CompileConfig.build(cfg, bundle),
          Svc.OptimizeConfig.build(cfg, bundle),
          cfg.override,
          bundle.override,
        ),
      ),
    );

    res.push(Svc.AssetConfig.build(cfg));

    fs.emptyDirSync(cfg.distPath);

    return res;
  } catch (e) {
    return Promise.reject(e);
  }
}
