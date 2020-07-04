const rule = require('../../../lib/rules/member-align');
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester();

ruleTester.run('member-align', rule, {
    valid: [
    ],
    invalid: [
    ]
});