import { resolve, commonjs, babel, terser, copy, scss } from '@kosatyi/rollup'
import fs from 'fs'
import path from 'path'
import favicons from 'rollup-plugin-favicons'
import sprite from 'rollup-plugin-svg-sprite'

const writeFile = (basePath) => {
    return ({ name, contents }) => {
        fs.writeFileSync(path.resolve(basePath, name), contents)
    }
}

const buildPath = 'dist'
const rootPath = '/dist'

const vendorInput = '_assets/vendor.js'
const vendorOutput = {
    file: 'dist/vendor.js',
    format: 'umd',
}

const entryInput = '_assets/index.js'
const entryOutput = {
    file: 'dist/index.js',
    format: 'umd',
    globals: {
        jquery: '$',
    },
}

const babelConfig = {
    babelHelpers: 'bundled',
}

const scssConfig = {
    output: 'dist/index.css',
    watch: '_assets/scss',
}

const terserConfig = {
    mangle: {
        reserved: ['$'],
    },
    format: {
        comments: false,
    },
}

const copyConfig = {
    targets: [
        {
            src: ['node_modules/@fontsource/inter/files/inter-all-*.woff'],
            dest: 'dist/fonts',
        },
    ],
}

const spriteConfig = {
    outputFolder: buildPath,
}


const faviconConfig = {
    source: '_assets/brand/logo-icon.svg',
    callback({ images, files, html }) {
        fs.mkdirSync('dist/favicon', { recursive: true })
        fs.writeFileSync('_includes/carcass/favicon.liquid', html.join('\n'))
        images.forEach(writeFile('dist/favicon'))
        files.forEach(writeFile('dist/favicon'))
    },
    configuration: {
        path: rootPath.concat('/favicon'),
        appName: 'Barbaricum - Археологія України',
        appShortName: 'Barbaricum',
        appDescription: 'Summary description',
        developerName: 'Stepan Kosatyi',
        developerURL: 'https://kosatyi.com',
        version: '2.0',
        dir: 'auto',
        lang: 'en-US',
        theme_color: '#0f1212',
        appleStatusBarStyle: 'default',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        replace: true,
        start_url: '/',
        preferRelatedApplications: false,
        files: {
            android: {
                manifestFileName: 'manifest.json',
            },
        },
        pixel_art: false,
        loadManifestWithCredentials: false,
        manifestMaskable: true,
        output: {
            images: true,
            files: true,
            html: true,
        },
        icons: {
            android: true,
            appleIcon: true,
            appleStartup: false,
            favicons: true,
            windows: true,
            yandex: false,
        },
    },
}

export default [
    {
        input: entryInput,
        output: entryOutput,
        external: ['jquery'],
        plugins: [
            commonjs(),
            resolve(),
            babel(babelConfig),
            terser(terserConfig),
            scss(scssConfig),
            copy(copyConfig),
            favicons(faviconConfig),
            sprite(spriteConfig),
        ],
    },
    {
        input: vendorInput,
        output: vendorOutput,
        plugins: [commonjs(), resolve(), babel(babelConfig), terser(terserConfig)],
    },
]
