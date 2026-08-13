import {EmulatorSpecification, Framework, Kind, Message, Suite, TestScenario, Verbosity,} from '../../src/index';
import * as fs from 'fs';
import * as path from 'path';
import {find, parseArguments, parseAsserts, parseResult} from './spec.util';

const framework = Framework.getImplementation();

const r3: Suite = framework.suite('End-to-end tests: R3 benchmark suite');

r3.testee('emulator [:8530]', new EmulatorSpecification(8530));

const scenarios: TestScenario[] = [];
const r3Directory = path.resolve(__dirname, 'r3');
const unsupportedBenchmarks = new Set([
    'bullet.wasm',
    'funky-kart.wasm',
    'guiicons.wasm',
    'mandelbrot.wasm',
    'pacalc.wasm',
    'rfxgen.wasm',
    'rguistyler.wasm',
    'riconpacker.wasm',
    'sqlgui.wasm'
]);

if (fs.existsSync(r3Directory)) {
    fs.readdirSync(r3Directory)
        .filter((file: string) => file.endsWith('.wasm') && !unsupportedBenchmarks.has(file))
        .forEach((wasmFile: string) => {
            scenarios.push({
                title: `R3: ${wasmFile}`,
                program: path.join(r3Directory, wasmFile),
                dependencies: [],
                steps: [{
                    title: `Run ${wasmFile}`,
                    instruction: {kind: Kind.Request, value: Message.run}
                }]
            });
        });
}

r3.tests(scenarios);

const spec: Suite = framework.suite('End-to-end tests: WebAssembly specification suite');

spec.testee('emulator [:8520]', new EmulatorSpecification(8520));

const specDirectory = path.resolve(__dirname, 'spec');
const specScenarios: TestScenario[] = fs.readdirSync(specDirectory)
    .filter((file: string) => file.endsWith('.asserts'))
    .sort()
    .map((assertsFile: string) => {
        const module = assertsFile.replace('.asserts', '.wasm');

        return {
            title: `Spec: ${module}`,
            program: path.join(specDirectory, module),
            dependencies: [],
            steps: parseAsserts(path.join(specDirectory, assertsFile)).map(assertion => {
                const cursor = {value: 0};
                const functionName = find(/invoke "([^"]+)"/, assertion);
                const args = parseArguments(assertion, cursor);
                const result = parseResult(assertion.slice(cursor.value));

                return {
                    title: assertion,
                    instruction: {kind: Kind.Request as const, value: Message.invoke(functionName, args)},
                    expected: [{value: {kind: 'primitive' as const, value: result?.value}}]
                };
            })
        };
    });

spec.tests(specScenarios);

framework.reporter.verbosity(Verbosity.normal);
framework.analyse([r3, spec]);
