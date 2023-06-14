import * as esbuild from 'esbuild';
import * as path from 'node:path';

await esbuild.build({
  entryPoints: [path.resolve('src', 'index.js')],
  outfile: path.resolve('dist', 'static', 'bundle.js'),
  bundle: true,
  minify: true,
  sourcemap: true,
  logLevel: 'info',
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
});