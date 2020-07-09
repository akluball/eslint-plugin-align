const rule = require('../../../lib/rules/member-indent-align');
const { RuleTester } = require('eslint');
const { dedent } = require('../../../lib/util');

const ruleTester = new RuleTester();

const valid = [
    // dot at start of line
    {
        code: `
        root.first
            .second = null;`
    },
    {
        code: `
        root.first.second
                  .third.fourth
                        .fifth = null;`
    },
    {
        code: `
        root
            .first = null;`
    },
    // dot at end of line
    {
        code: `
        root.first.
             second = null;`
    },
    {
        code: `
        root.
             first = null;`
    },
    {
        code: `
        root
            .
             first = null;`
    },
    // bracket
    {
        code: `
        root['first']
            ['second'] = null;`
    },
    {
        code: `
        root
            ['first'] = null;`
    },
    {
        code: `
        root.first
            [
                'second'
            ].
             third = null;`
    },
    {
        code: `
        root.first
            [
              'second'
            ].
             third = null;`,
        options: [ { bracketPropertyIndent: 2 } ]
    },
    // calls
    {
        code: `
        root.first.second()
                  .third = null;`
    },
    {
        code: `
        root.first().second
                    .third();`
    },
    {
        code: `
        root.first().
             second();`
    },
    // multiline call parentheses
    {
        code: `
        root.first(
        ).second
         .third = null;`
    },
    {
        code: `
        root.first(
        )
            .second
            .third = null;`
    },
    {
        code: `
        root.first(
        ).second.
          third = null;`
    },
    {
        code: `
        root.first(
        ).
             second.
             third = null;`
    },
    // call parentheses leading line
    {
        code: `
        root.first
        ().second = null;`
    },
    // nested
    {
        code: `
        outer.first(inner.first
                         .second.third
                                .fourth)
             .second = null;`
    },
    {
        code: `
        outer.first(inner.first
                         .second.third
                                .fourth).second
                                        .third = null;`
    },
    // empty lines
    {
        code: `
        root.first
        
            .second.third
            
                   .fourth = null;`
    },
    // comment
    {
        code: `
        root.first
        /* comment */.second
                     .third = null;`
    },
    {
        code: `
        root['first'
        /* comment */] = null;`
    },
    {
        code: `
        root.
        /* comment */first = null;`
    },
    {
        code: `
        root/* comment */.first
                         .second = null;`
    },
    // multiple calls in a row
    {
        code: `
        root.first()().second
                      .third = null;`
    }
];

const invalid = [
    // dot at start of line
    {
        code: `
        root.first.second
                   .third = null;`,
        errors: [ {
            message: 'member dot operator should be at column 10',
            line: 2, column: 12,
            endLine: 2, endColumn: 13
        } ],
        output: `
        root.first.second
                  .third = null;`
    },
    {
        code: `
        root.first.second
            .third = null;`,
        errors: [ {
            message: 'member dot operator should be at column 10',
            line: 2, column: 5,
            endLine: 2, endColumn: 6
        } ],
        output: `
        root.first.second
                  .third = null;`
    },
    {
        code: `
        root
             .first = null;`,
        errors: [ {
            message: 'member dot operator should be at column 4',
            line: 2, column: 6,
            endLine: 2, endColumn: 7
        } ],
        output: `
        root
            .first = null;`,
    },
    {
        code: `
        root
           .first = null;`,
        errors: [ {
            message: 'member dot operator should be at column 4',
            line: 2, column: 4,
            endLine: 2, endColumn: 5
        } ],
        output: `
        root
            .first = null;`,
    },
    {
        code: `
        root
        .first
              .second.third
                     .fourth = null;`,
        errors: [ {
            message: 'member dot operator should be at column 4',
            line: 2, column: 1,
            endLine: 2, endColumn: 2
        }, {
            message: 'member dot operator should be at column 4',
            line: 3, column: 7,
            endLine: 3, endColumn: 8
        }, {
            message: 'member dot operator should be at column 11',
            line: 4, column: 14,
            endLine: 4, endColumn: 15
        } ],
        output: `
        root
            .first
            .second.third
                   .fourth = null;`,
    },
    // dot at end of line
    {
        code: `
        root.first.
            second = null;`,
        errors: [ {
            message: 'property should start at column 5',
            line: 2, column: 5,
            endLine: 2, endColumn: 11
        } ],
        output: `
        root.first.
             second = null;`
    },
    {
        code: `
        root.first.
          second = null;`,
        errors: [ {
            message: 'property should start at column 5',
            line: 2, column: 3,
            endLine: 2, endColumn: 9
        } ],
        output: `
        root.first.
             second = null;`
    },
    {
        code: `
        root.
          first = null;`,
        errors: [ {
            message: 'property should start at column 5',
            line: 2, column: 3,
            endLine: 2, endColumn: 8
        } ],
        output: `
        root.
             first = null;`
    },
    {
        code: `
        root
        .
        first = null;`,
        errors: [ {
            message: 'member dot operator should be at column 4',
            line: 2, column: 1,
            endLine: 2, endColumn: 2
        }, {
            message: 'property should start at column 5',
            line: 3, column: 1,
            endLine: 3, endColumn: 6
        } ],
        output: `
        root
            .
             first = null;`
    },
    //bracket
    {
        code: `
        root['first']
                ['second'] = null;`,
        errors: [ {
            message: 'member open bracket should be at column 4',
            line: 2, column: 9,
            endLine: 2, endColumn: 10
        } ],
        output: `
        root['first']
            ['second'] = null;`
    },
    {
        code: `
        root
          ['first'] = null;`,
        errors: [ {
            message: 'member open bracket should be at column 4',
            line: 2, column: 3,
            endLine: 2, endColumn: 4
        } ],
        output: `
        root
            ['first'] = null;`
    },
    {
        code: `
        root[
             'first'
        ] = null;`,
        errors: [ {
            message: 'property should start at column 8',
            line: 2, column: 6,
            endLine: 2, endColumn: 13
        }, {
            message: 'member close bracket should be at column 4',
            line: 3, column: 1,
            endLine: 3, endColumn: 2
        } ],
        output: `
        root[
                'first'
            ] = null;`
    },
    {
        code: `
        root.first
            [
             'second'
            ].
             third = null;`,
        errors: [ {
            message: 'property should start at column 8',
            line: 3, column: 6,
            endLine: 3, endColumn: 14
        } ],
        output: `
        root.first
            [
                'second'
            ].
             third = null;`
    },
    // calls
    {
        code: `
        root.first().second
        .third();`,
        errors: [ {
            message: 'member dot operator should be at column 12',
            line: 2, column: 1,
            endLine: 2, endColumn: 2
        } ],
        output: `
        root.first().second
                    .third();`
    },
    {
        code: `
        root.first.second()
                           .third = null;`,
        errors: [ {
            message: 'member dot operator should be at column 10',
            line: 2, column: 20,
            endLine: 2, endColumn: 21
        } ],
        output: `
        root.first.second()
                  .third = null;`
    },
    {
        code: `
        root.first.second().
                            third();`,
        errors: [ {
            message: 'property should start at column 11',
            line: 2, column: 21,
            endLine: 2, endColumn: 26
        } ],
        output: `
        root.first.second().
                   third();`
    },
    // multiline call parentheses
    {
        code: `
        root.first(
        ).second
              .third = null;`,
        errors: [ {
            message: 'member dot operator should be at column 1',
            line: 3, column: 7,
            endLine: 3, endColumn: 8
        } ],
        output: `
        root.first(
        ).second
         .third = null;`,
    },
    {
        code: `
        root.first(
        )
         .third = null;`,
        errors: [ {
            message: 'member dot operator should be at column 4',
            line: 3, column: 2,
            endLine: 3, endColumn: 3
        } ],
        output: `
        root.first(
        )
            .third = null;`
    },
    {
        code: `
        root.first(
        ).second.
              third = null;`,
        errors: [ {
            message: 'property should start at column 2',
            line: 3, column: 7,
            endLine: 3, endColumn: 12
        } ],
        output: `
        root.first(
        ).second.
          third = null;`,
    },
    {
        code: `
        root.first(
        ).
          third = null;`,
        errors: [ {
            message: 'property should start at column 5',
            line: 3, column: 3,
            endLine: 3, endColumn: 8
        } ],
        output: `
        root.first(
        ).
             third = null;`
    },
    // call parentheses leading line
    {
        code: `
        root.first
        ().second
        .third = null;`,
        errors: [ {
            message: 'member dot operator should be at column 2',
            line: 3, column: 1,
            endLine: 3, endColumn: 2
        } ],
        output: `
        root.first
        ().second
          .third = null;`
    },
    // nested
    {
        code: `
        outer.first(inner.first
             .second.third
            .fourth)
          .second();`,
        errors: [ {
            message: 'member dot operator should be at column 17',
            line: 2, column: 6,
            endLine: 2, endColumn: 7
        }, {
            message: 'member dot operator should be at column 24',
            line: 3, column: 5,
            endLine: 3, endColumn: 6
        }, {
            message: 'member dot operator should be at column 5',
            line: 4, column: 3,
            endLine: 4, endColumn: 4
        } ],
        output: `
        outer.first(inner.first
                         .second.third
                                .fourth)
             .second();`
    },
    {
        code: `
        outer.first(inner.first
             .second.third()
            .fourth).second
            .third();`,
        errors: [ {
            message: 'member dot operator should be at column 17',
            line: 2, column: 6,
            endLine: 2, endColumn: 7
        }, {
            message: 'member dot operator should be at column 24',
            line: 3, column: 5,
            endLine: 3, endColumn: 6
        }, {
            message: 'member dot operator should be at column 12',
            line: 4, column: 5,
            endLine: 4, endColumn: 6
        } ],
        output: `
        outer.first(inner.first
                         .second.third()
                                .fourth).second
                    .third();`
    },
    {
        code: `
        outer.first(inner.first
                         .second.third()
                                .fourth).second
                    .third();`,
        errors: [ {
            message: 'member dot operator should be at column 32',
            line: 4, column: 13,
            endLine: 4, endColumn: 14
        } ],
        output: `
        outer.first(inner.first
                         .second.third()
                                .fourth).second
                                        .third();`
    },
    {
        code: `
        outer.first(inner.first.
              second.third.
             fourth).
           second();`,
        errors: [ {
            message: 'property should start at column 18',
            line: 2, column: 7,
            endLine: 2, endColumn: 13
        }, {
            message: 'property should start at column 25',
            line: 3, column: 6,
            endLine: 3, endColumn: 12
        }, {
            message: 'property should start at column 6',
            line: 4, column: 4,
            endLine: 4, endColumn: 10
        } ],
        output: `
        outer.first(inner.first.
                          second.third.
                                 fourth).
              second();`
    },
    {
        code: `
        outer.first(inner.first.
              second.third().
             fourth).second.
             third();`,
        errors: [ {
            message: 'property should start at column 18',
            line: 2, column: 7,
            endLine: 2, endColumn: 13
        }, {
            message: 'property should start at column 25',
            line: 3, column: 6,
            endLine: 3, endColumn: 12
        }, {
            message: 'property should start at column 13',
            line: 4, column: 6,
            endLine: 4, endColumn: 11
        } ],
        output: `
        outer.first(inner.first.
                          second.third().
                                 fourth).second.
                     third();`
    },
    {
        code: `
        outer.first(inner.first.
                          second.third().
                                 fourth).second.
                     third();`,
        errors: [ {
            message: 'property should start at column 33',
            line: 4, column: 14,
            endLine: 4, endColumn: 19
        } ],
        output: `
        outer.first(inner.first.
                          second.third().
                                 fourth).second.
                                         third();`
    },
    // empty lines
    {
        code: `
        root.first
        
        .second.third
        
            .fourth = null;`,
        errors: [ {
            message: 'member dot operator should be at column 4',
            line: 3, column: 1,
            endLine: 3, endColumn: 2
        }, {
            message: 'member dot operator should be at column 11',
            line: 5, column: 5,
            endLine: 5, endColumn: 6
        } ],
        output: `
        root.first
        
            .second.third

                   .fourth = null;`
    },
    //comment
    {
        code: `
        root.first
        /* comment */.second
        .third = null;`,
        errors: [ {
            message: 'member dot operator should be at column 13',
            line: 3, column: 1,
            endLine: 3, endColumn: 2
        } ],
        output: `
        root.first
        /* comment */.second
                     .third = null;`
    },
    {
        code: `
        root.first
        /* comment */.second.
        third = null;`,
        errors: [ {
            message: 'property should start at column 14',
            line: 3, column: 1,
            endLine: 3, endColumn: 6
        } ],
        output: `
        root.first
        /* comment */.second.
                      third = null;`
    },
    {
        code: `
        root/* comment */.first
        .second = null;`,
        errors: [ {
            message: 'member dot operator should be at column 17',
            line: 2, column: 1,
            endLine: 2, endColumn: 2
        } ],
        output: `
        root/* comment */.first
                         .second = null;`
    },
    // multiple calls in a row
    {
        code: `
        root.first()()
        .second
                             .third = null;`,
        errors: [ {
            message: 'member dot operator should be at column 4',
            line: 2, column: 1,
            endLine: 2, endColumn: 2
        }, {
            message: 'member dot operator should be at column 4',
            line: 3, column: 22,
            endLine: 3, endColumn: 23
        } ],
        output: `
        root.first()()
            .second
            .third = null;`
    }
];

valid.forEach(testCase => {
    testCase.code = dedent(testCase.code);
});
invalid.forEach(testCase => {
    testCase.code = dedent(testCase.code);
});
invalid.forEach(testCase => {
    testCase.output = dedent(testCase.output);
});

ruleTester.run('member-indent-align', rule, { valid, invalid });