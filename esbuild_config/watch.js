import * as esbuild from 'esbuild';
import * as path from 'node:path';

const ctx = await esbuild.context({
  entryPoints: [path.resolve('src', 'index.js')],
  outfile: path.resolve('dist', 'static', 'bundle.js'),
  bundle: true,
  minify: false,
  sourcemap: true,
	logLevel: 'debug',
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
});

await ctx.watch();