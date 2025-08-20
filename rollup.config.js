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
                config: true,
                inject: false // Don't inject CSS into the bundle
            }),
            terser({
                format: {
                    preamble: `"use client";`
                }
            }),
            analyze({ summaryOnly: true })
        ],
        external: [/\.stories\.tsx$/, /\.css$/]
    }
}

export default [
    getBuildConfig(
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true
        }
    ),
    getBuildConfig(
        {
            file: pkg.module,
            format: 'esm',
            sourcemap: true
        }
    ),
    {
        input: 'src/index.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts.default()],
        external: [/\.css$/]
    }
]
