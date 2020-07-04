/* global target exec rm */
require('shelljs/make');

const path = require('path');

const projectRoot = process.env.INIT_CWD;

function resolve(...components) {
    return path.resolve(projectRoot, ...components);
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
    rm('-r', resolve('node_modules'));
};

target.lint = function(options) {
    exec(`${eslint} ${eslintOpts.concat(options).join(' ')} ${lib} ${tests} ${makefile}`);
};

target.test = function() {
    exec(`${mocha} ${mochaOpts.join(' ')} ${tests}/**/*.js`);
};