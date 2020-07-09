function dedent(code) {
    const lines = code.split(/\r?\n/).slice(1);
    const indent = new RegExp(`^${lines[0].match(/^\s*/)[0]}`);
    return lines.map(line => line.replace(indent, '')).join('\n');
}

function spaces(count) {
    return new Array(count).fill(' ').join('');
}

module.exports = {
    dedent,
    spaces
};