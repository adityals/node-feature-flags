/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')

console.log('[FeatureFlag][Build] In Progress...')

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      minify: true,
      target: 'node12',
      treeShaking: true,
      outfile: 'dist/index.js',
      logLevel: 'info',
      plugins: [nodeExternalsPlugin()],
    })
  } catch (ex) {
    console.error('[FeatureFlag][Build] Error:', ex)
  }
}

build()
