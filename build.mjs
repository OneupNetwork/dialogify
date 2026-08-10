import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import postcss from 'postcss';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import { sassPlugin } from 'esbuild-sass-plugin';
import { replace } from 'esbuild-plugin-replace';

const jqueryGlobalShim = path.resolve('src/js/jquery-global.js');

// Build the CSS once, reuse for the standalone file and the embedded builds.
async function buildCss() {
    const result = await esbuild.build({
        entryPoints: ['src/scss/dialogify.scss'],
        bundle: true,
        minify: true,
        write: false,
        plugins: [
            sassPlugin({
                async transform(source) {
                    const { css } = await postcss([
                        autoprefixer,
                        postcssPresetEnv({ stage: 0 })
                    ]).process(source, { from: undefined });
                    return css;
                }
            })
        ]
    });

    return new TextDecoder().decode(result.outputFiles[0].contents);
}

// Escape the CSS so it can be embedded inside a single-quoted string literal.
// Order matters: backslashes first, then single quotes, then strip newlines.
function toCssLiteral(css) {
    return css.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '');
}

// Build the dialogify bundles that embed the CSS at runtime.
async function buildJs(cssLiteral) {
    const cssReplace = replace({ __css__: cssLiteral });

    // Browser / IIFE build: jQuery is a global peer dependency, so alias the
    // bare `jquery` import to the global shim instead of embedding a copy.
    await esbuild.build({
        entryPoints: ['src/js/dialogify.js'],
        bundle: true,
        minify: true,
        sourcemap: true,
        format: 'iife',
        outfile: 'dist/dialogify.min.js',
        target: ['es2018'],
        alias: { jquery: jqueryGlobalShim },
        plugins: [cssReplace]
    });

    // ESM build: jQuery stays external for the consumer's bundler to resolve.
    await esbuild.build({
        entryPoints: ['src/js/dialogify.js'],
        bundle: true,
        minify: true,
        sourcemap: true,
        format: 'esm',
        outfile: 'dist/dialogify.mjs',
        target: ['es2018'],
        external: ['jquery'],
        plugins: [cssReplace]
    });

    // CommonJS build. Re-export the default as module.exports so consumers can
    // `require('@oneup_network/dialogify')` and get the class directly (this
    // matches the `export = Dialogify` TypeScript definition).
    await esbuild.build({
        entryPoints: ['src/js/dialogify.js'],
        bundle: true,
        minify: true,
        sourcemap: true,
        format: 'cjs',
        outfile: 'dist/dialogify.cjs',
        target: ['es2018'],
        external: ['jquery'],
        footer: {
            js: 'if(module.exports&&module.exports.default){module.exports=module.exports.default}'
        },
        plugins: [cssReplace]
    });
}

// Build the optional dialog-polyfill bundle (exposes window.dialogPolyfill).
async function buildPolyfill() {
    await esbuild.build({
        entryPoints: ['src/js/dialog-polyfill.browser.js'],
        bundle: true,
        minify: true,
        sourcemap: true,
        format: 'iife',
        outfile: 'dist/dialog-polyfill.min.js',
        target: ['es2018']
    });

    // Customized built-in elements polyfill for Safari/WebKit, needed only for
    // the declarative `<dialog is="bahamut-dialogify">` syntax.
    await esbuild.build({
        entryPoints: ['src/js/custom-elements.browser.js'],
        bundle: true,
        minify: true,
        sourcemap: true,
        format: 'iife',
        outfile: 'dist/custom-elements.min.js',
        target: ['es2018']
    });
}

async function main() {
    fs.mkdirSync('dist', { recursive: true });
    fs.mkdirSync('src/css', { recursive: true });

    const css = await buildCss();

    // Standalone stylesheet (link with id="dialogifyCss" to disable JS injection).
    fs.writeFileSync('dist/dialogify.css', css);
    fs.writeFileSync('src/css/dialogify.css', css);

    await buildJs(toCssLiteral(css));
    await buildPolyfill();

    // Keep the demo site in sync.
    fs.mkdirSync('docs/js', { recursive: true });
    fs.mkdirSync('docs/css', { recursive: true });
    fs.copyFileSync('dist/dialogify.min.js', 'docs/js/dialogify.min.js');
    fs.copyFileSync('dist/dialog-polyfill.min.js', 'docs/js/dialog-polyfill.min.js');
    fs.copyFileSync('dist/custom-elements.min.js', 'docs/js/custom-elements.min.js');
    fs.copyFileSync('dist/dialogify.css', 'docs/css/dialogify.css');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
