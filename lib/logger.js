const chalk = require('chalk');
const { spaces } = require('./util');

function ruleError(rule, ...lines) {
    if (lines.length === 0) {
        return;
    }
    const prefixText = `${rule}: `;
    const prefix = chalk.red(prefixText);
    console.error(prefix + lines[0]);
    const emptyPrefix = spaces(prefixText.length);
    for (let i = 1; i < lines.length; i++) {
        console.error(emptyPrefix + lines[i]);
    }
}

module.exports = {
    ruleError
};