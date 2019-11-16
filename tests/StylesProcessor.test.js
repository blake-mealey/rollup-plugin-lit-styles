import test from 'ava';
import sinon from 'sinon';
import StylesProcessor from '../src/StylesProcessor';

test.afterEach(() => {
    sinon.restore();
});

test(`process returns an empty object when no process function is supplied`, async t => {
    const processor = new StylesProcessor();

    t.deepEqual(await processor.process(), {});
});

test(`process returns an empty object when process function returns nothing`, async t => {
    const processor = new StylesProcessor({
        process: async () => null
    });

    t.deepEqual(await processor.process(), {});
});

test(`process returns result of supplied process function`, async t => {
    const processor = new StylesProcessor({
        process: async () => `result`
    });

    t.deepEqual(await processor.process(), `result`);
});

test(`does not process any extension when no extensions are supplied`, async t => {
    const processor = new StylesProcessor();

    t.assert(!processor.doesProcess(`.any`));
});

test(`does not process extensions that are not supplied`, async t => {
    const processor = new StylesProcessor({
        extensions: [ `.css` ]
    });

    t.assert(!processor.doesProcess(`.scss`));
});

test(`does process extensions that are supplied`, async t => {
    const processor = new StylesProcessor({
        extensions: [ `.css` ]
    });

    t.assert(processor.doesProcess(`.css`));
});

test(`does process any extension when the * extension is supplied`, async t => {
    const processor = new StylesProcessor({
        extensions: [ `*` ]
    });

    t.assert(processor.doesProcess(`.any`));
});

test(`does process supplied extensions when the * extension is supplied`, async t => {
    const processor = new StylesProcessor({
        extensions: [ `*`, `.css` ]
    });

    t.assert(processor.doesProcess(`.css`));
});
