/* global target exec rm */
require('shelljs/make');

const path = require('path');

function resolve(...components) {
    return path.resolve(__dirname, ...components);
}

function resolveNodeModuleBinary(binary) {
    return resolve('node_modules', '.bin', binary);
}

const eslint = resolveNodeModuleBinary('eslint');
const eslintOpts = [];
const mocha = resolveNodeModuleBinary('mocha');
const mochaOpts = [];
const lib = resolve('lib');
const tests = resolve('tests');
const makefile = resolve('Makefile.js');

if (process.env.TRAVIS !== 'true') {
    eslintOpts.push('--color');
    mochaOpts.push('--color');
}

target.clean = function() {
    rm('-rf', resolve('node_modules'));
};

target.lint = function(options) {
    exec(`${eslint} ${eslintOpts.concat(options).join(' ')} ${lib} ${tests} ${makefile}`);
};

target.prepublish = function() {
    target.lint();
    target.test();
};

target.test = function() {
    exec(`${mocha} ${mochaOpts.join(' ')} ${tests}/**/*.js`);
};