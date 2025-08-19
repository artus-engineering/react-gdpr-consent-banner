import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import analyze from 'rollup-plugin-analyzer'
import dts from 'rollup-plugin-dts'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'

const pkg = require('./package.json')

function getBuildConfig(output, cssImport) {
    return {
        input: 'src/index.ts',
        output: [output],
        plugins: [
            peerDepsExternal(),
            commonjs(),
            typescript({ tsconfig: './tsconfig.build.json' }),
            postcss({
                minimize: true,
                extract: true,
                config: true
            }),
            terser({
                format: {
                    preamble: `"use client";${cssImport}`
                }
            }),
            analyze({ summaryOnly: true })
        ],
        external: [/\.stories\.tsx$/]
    }
}

export default [
    getBuildConfig(
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true
        },
        "require('./index.css');"
    ),
    getBuildConfig(
        {
            file: pkg.module,
            format: 'esm',
            sourcemap: true
        },
        'import"./index.css";'
    ),
    {
        input: 'src/index.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts.default()],
        external: [/\.css$/]
    }
]
