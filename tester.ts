// This file compiles the project with source maps enabled and runs
// tests using Node's Jest program.
// run using deno run -A tester.ts --coverage
import * as esbuild from 'https://deno.land/x/esbuild@v0.17.5/mod.js'

const everything = await esbuild.build({
    entryPoints: ['./src/everything.ts'],
    format: 'cjs',
    minify: false,
    target: ['esnext'],
    bundle: true,
    sourcemap: 'inline',
    outfile: 'tests/everything.js'
})
if (everything.errors.length > 0 || everything.warnings.length > 0) {
    console.error(everything)
}

const testEntryPoints = []
const testsToRun = []
for (const entry of Deno.readDirSync('./src')) {
    if (entry.isFile && entry.name.endsWith(".test.ts")) {
        testEntryPoints.push('./src/' + entry.name)
        testsToRun.push('./tests/' + entry.name.replace('.test.ts', '.test.js'))
    }
}
console.log('tests detected:', testEntryPoints)

const tests = await esbuild.build({
    entryPoints: testEntryPoints,
    format: 'cjs',
    minify: false,
    target: ['esnext'],
    bundle: true,
    sourcemap: 'inline',
    external: ['everything', '@jest/globals'],
    outdir: 'tests/',
})
if (tests.errors.length > 0 || tests.warnings.length > 0) {
    console.error(tests)
}

esbuild.stop()

try {
    await Deno.stat('tests/node_modules')
} catch (_e) {
    // Node modules is missing and must be created.
    const package_manager = Deno.env.get('NODE_NPM')
        || (Deno.build.os === 'windows' ? 'npm.cmd' : 'npm')
    console.log('create node_modules')
    await Deno.run({
        cmd: [package_manager, 'install'],
        shell: true,
        cwd: './tests'
    }).status()
}

await Deno.run({
    cmd: ['node', 'node_modules/jest/bin/jest.js', ...Deno.args, ...testsToRun],
    shell: true,
    cwd: './tests'
}).status()

// webassembly edition:
//import * as esbuild from 'https://deno.land/x/esbuild@v0.17.5/wasm.js'
// wasm currently can't read dir, impl using plugin: https://esbuild.github.io/plugins/#resolve
//import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";

// Circumvent wasm bug: https://esbuild.github.io/getting-started/#deno
Deno.exit(0)