const config = require('../../config');
const { MEMBER_EXPRESSION, CALL_EXPRESSION } = require('../estree-nodes');
const logger = require('../logger');
const { spaces } = require('../util');

function getDotOrOpenBracket(context, memberExpression) {
    const { object, property } = memberExpression;
    return context.getSourceCode()
                  .getFirstTokenBetween(object, property, { includeComments: false });
}

function separateLines(a, b) {
    return a.loc.end.line !== b.loc.start.line;
}

function leadsLine(context, node) {
    const previous = context.getSourceCode().getTokenBefore(node, { includeComments: true });
    return separateLines(previous, node);
}

function computeAlignShift(dot, alignCol) {
    return alignCol - dot.loc.start.column;
}

function logNonWhitespaceFix(filename, loc, text) {
    logger.ruleError('eslint-plugin-align/member-indent-align',
                     'nonwhitespace removal attempted during fix',
                     `attempted to remove '${text}' preceding line ${loc.line}, column ${loc.column} of ${filename}`,
                     'this rule should only remove whitespace',
                     `please report this error to ${config.ISSUES_URI}`);
}

function reportUnaligned(context, node, alignCol, message) {
    context.report({
        message: `${message} column ${alignCol}`,
        loc: node.loc,
        fix: function (fixer) {
            const src = context.getSourceCode();
            const alignShift = computeAlignShift(node, alignCol);
            if (alignShift > 0) {
                return fixer.insertTextBefore(node, spaces(alignShift));
            } else {
                const startIndex = src.getIndexFromLoc(node.loc.start);
                const removalRange = [ startIndex + alignShift, startIndex ];
                const toBeRemoved = src.getText().slice(...removalRange);
                if (toBeRemoved.trim().length === 0) {
                    return fixer.removeRange(removalRange);
                } else {
                    logNonWhitespaceFix(context.getFilename(), node.loc.start, toBeRemoved);
                    return null;
                }
            }
        }
    });
}

function reportUnalignedDot(context, dot, alignCol) {
    reportUnaligned(context, dot, alignCol, 'member dot operator should be at');
}

function reportUnalignedOpenBracket(context, openBracket, alignCol) {
    reportUnaligned(context, openBracket, alignCol, 'member open bracket should be at');
}

function reportUnalignedCloseBracket(context, closeBracket, alignCol) {
    reportUnaligned(context, closeBracket, alignCol, 'member close bracket should be at');
}

function reportUnalignedProperty(context, property, alignCol) {
    reportUnaligned(context, property, alignCol, 'property should start at');
}

function isStartOfChain(memberExpression) {
    let focus = memberExpression.object;
    while (focus.type === CALL_EXPRESSION) {
        focus = focus.callee;
    }
    return focus.type !== MEMBER_EXPRESSION;
}

function isCallee(node) {
    return (node.parent.type === CALL_EXPRESSION) && (node.parent.callee === node);
}

function chainAdvance(memberExpression) {
    let focus = memberExpression;
    while (isCallee(focus)) {
        focus = focus.parent;
    }
    if (focus.parent.type === MEMBER_EXPRESSION) {
        return focus.parent;
    } else {
        return null;
    }
}

function align(context, node) {
    const options = {
        bracketPropertyIndent: 4
    };
    Object.assign(options, context.options[0]);
    if (!isStartOfChain(node)) {
        return;
    }
    let focus = node;
    let line = focus.object.loc.end.line;
    let punctuatorAlignCol = focus.object.loc.end.column;
    let punctuatorAlignShift = 0;
    let propertyAlignCol = punctuatorAlignCol + 1;
    let propertyAlignShift = 0;
    do {
        const punctuator = getDotOrOpenBracket(context, focus);
        // leading puncuator alignment
        if (leadsLine(context, punctuator)) {
            if (punctuator.loc.start.column !== punctuatorAlignCol) {
                if (punctuator.value === '.') {
                    reportUnalignedDot(context, punctuator, punctuatorAlignCol);
                } else {
                    reportUnalignedOpenBracket(context, punctuator, punctuatorAlignCol);
                }
                punctuatorAlignShift = computeAlignShift(punctuator, punctuatorAlignCol);
            } else {
                punctuatorAlignShift = 0;
            }
        } else {
            if (punctuator.loc.start.line !== line) {
                punctuatorAlignShift = 0;
            }
            punctuatorAlignCol = punctuator.loc.start.column + punctuatorAlignShift;
        }
        // trailing punctuator alignment (in case of bracket notation)
        if (punctuator.value === '[') {
            const closingBracket = context.getSourceCode().getTokenAfter(focus.property);
            if (leadsLine(context, closingBracket)) {
                if (closingBracket.loc.start.column !== punctuator.loc.start.column) {
                    reportUnalignedCloseBracket(context, closingBracket, punctuator.loc.start.column);
                }
            }
        }
        // property alignment
        if (leadsLine(context, focus.property)) {
            if (punctuator.value === '.') {
                if (focus.property.loc.start.column !== propertyAlignCol) {
                    reportUnalignedProperty(context, focus.property, propertyAlignCol);
                    propertyAlignShift = computeAlignShift(focus.property, propertyAlignCol);
                }
            } else if (focus.property.loc.start.column !== punctuatorAlignCol + options.bracketPropertyIndent) {
                reportUnalignedProperty(context, focus.property, punctuatorAlignCol + options.bracketPropertyIndent);
                propertyAlignShift = computeAlignShift(focus.property, punctuatorAlignCol + options.bracketPropertyIndent);
            }
        } else {
            if (focus.property.loc.start.line !== line) {
                propertyAlignShift = 0;
            }
            if (punctuator.value === '.') {
                propertyAlignCol = focus.property.loc.start.column + propertyAlignShift;
            }
        }
        line = focus.loc.end.line;
        focus = chainAdvance(focus);
    } while (focus);
}

module.exports = {
    meta: {
        type: 'layout',
        fixable: 'whitespace',
        schema: [
            {
                type: 'object',
                properties: {
                    bracketPropertyIndent: {
                        type: 'integer',
                        minimum: 0,
                        default: 4
                    }
                }
            }
        ]
    },
    create: function (context) {
        return {
            [ MEMBER_EXPRESSION ]: align.bind(null, context)
        };
    }
};