import test from 'ava';
import sinon from 'sinon';
import litStyles from '../src';

test.afterEach(() => {
    sinon.restore();
});

test(`returns rollup plugin with correct name`, t => {
    const plugin = litStyles();

    t.is(plugin.name, `lit-styles`);
});
