// This file compiles the project with source maps enabled and runs
// tests using Node's Jest program.
// run using deno run -A tester.ts --coverage
import * as esbuild from 'https://deno.land/x/esbuild@v0.17.5/mod.js'

const test_entry_points = []
const tests_to_run = []
for (const entry of Deno.readDirSync('./src')) {
    if (entry.isFile && entry.name.endsWith(".test.ts")) {
        test_entry_points.push('./src/' + entry.name)
        tests_to_run.push('./tests/' + entry.name.replace('.test.ts', '.test.js'))
    }
}
console.log('tests detected:', test_entry_points)

function handle_build_result(build_result: esbuild.BuildResult) {
    if (build_result.errors.length > 0 || build_result.warnings.length > 0) {
        console.error(build_result)
        console.log('errors or warnings detected, cancelling tests')
        Deno.exit(1)
    }
}

const everything = await esbuild.build({
    entryPoints: ['./src/everything.ts'],
    format: 'cjs',
    minify: false,
    target: ['esnext'],
    bundle: true,
    sourcemap: 'inline',
    outfile: 'tests/everything.js'
})
handle_build_result(everything)

const tests = await esbuild.build({
    entryPoints: test_entry_points,
    format: 'cjs',
    minify: false,
    target: ['esnext'],
    bundle: true,
    sourcemap: 'inline',
    external: ['everything', '@jest/globals'],
    outdir: 'tests/',
})
handle_build_result(tests)

esbuild.stop()

try {
    await Deno.stat('tests/node_modules')
} catch (_e) {
    // Node modules is missing and must be created.
    const package_manager = Deno.env.get('NODE_NPM')
        || (Deno.build.os === 'windows' ? 'npm.cmd' : 'npm')
    console.log('create node_modules')
    const install_status = await Deno.run({
        cmd: [package_manager, 'install'],
        shell: true,
        cwd: './tests'
    }).status()
    if (!install_status.success) {
        console.error(`something went wrong while running ${package_manager} install`)
        Deno.exit(install_status.code)
    }
}

const status = await Deno.run({
    cmd: ['node', 'node_modules/jest/bin/jest.js', ...Deno.args, ...tests_to_run],
    shell: true,
    cwd: './tests'
}).status()

Deno.exit(status.code)

// webassembly edition:
//import * as esbuild from 'https://deno.land/x/esbuild@v0.17.5/wasm.js'
// wasm currently can't read dir, impl using plugin: https://esbuild.github.io/plugins/#resolve
//import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";
