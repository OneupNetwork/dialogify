import fs from 'node:fs'
import esbuild from 'esbuild'
import postcss from 'postcss'
import postcssPresetEnv from 'postcss-preset-env'
import autoprefixer from 'autoprefixer'
import { sassPlugin } from 'esbuild-sass-plugin'
import { replace } from 'esbuild-plugin-replace'

esbuild.build({
    entryPoints: ['src/scss/dialogify.scss'],
    bundle: true,
    minify: true,
    write: false,
    plugins: [sassPlugin({
        async transform(source, resolveDir) {
            const { css } = await postcss([autoprefixer, postcssPresetEnv({ stage: 0 })])
                .process(source, { from: undefined })
            return css
        }
    })]
}).then((result) => {
    const css = new TextDecoder().decode(result.outputFiles[0].contents)
    fs.writeFileSync('src/css/dialogify.css', css);

    return esbuild.build({
        entryPoints: ['src/js/dialogify.js'],
        bundle: true,
        minify: true,
        sourcemap: true,
        outfile: 'dist/dialogify.min.js',
        plugins: [replace({
            '__css__': css.replace(/'/g, "\\'").replace(/\\/g, '\\\\').replace(/\n/g, '')
        })]
    })
}).then(() => {
    fs.copyFileSync('dist/dialogify.min.js', 'docs/js/dialogify.min.js')
})

