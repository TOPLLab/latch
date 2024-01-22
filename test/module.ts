// module regression test

import {EmulatorSpecification, Framework, Kind, Message} from '../src';
import {readdirSync} from 'fs';

const folder: string = process.env.CORESUITE ?? '.';

const framework = Framework.getImplementation();

framework.suite('Test update module functionality');

framework.testee('emulator [:8500]', new EmulatorSpecification(8500));

const files: string[] = readdirSync(folder).filter((file) => file.endsWith('.asserts.wast'));

for (const file of files) {
    const module: string = file.replace('.asserts.wast', '.wast');

    const request = await Message.uploadFile(folder + module);
    framework.test({
        title: `Test upload ${module}`,
        program: 'test/address.wast',
        dependencies: [],
        steps: [{
            title: `upload ${module}`,
            instruction: {kind: Kind.Request, value: request}
        }]
    });
}

framework.run();
