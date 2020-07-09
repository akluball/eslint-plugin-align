# align the indentation of member expression chains

## Rule Details

This rule aligns the indentation of line-leading member expression parts (line-leading punctuator or property) in member expression chains.
Currently, the rule only supports aligning line-leading member expression parts to the closest preceding member expression part in the chain on a previous line.

## Options

This rule has an object option:

* `"bracketPropertyIndent"` (default: 4) - sets the number of indent spaces for a line-leading property in a member expression using bracket notation.

Examples of **incorrect** code for this rule with no options:
```js
root.first.second
    .third = null;

root.first.
    second = null;

root
.
first = null;
```

Examples of **correct** code for this rule with no options:
```js
root.first.second
          .third.fourth
                .fifth = null;

root.first.
     second = null;


root
    .
     first = null;
```

### bracketPropertyIndent

Examples of **incorrect** code for this rule with the `{ bracketPropertyIndent: 4 }` option:
```js
root.first
    [
     'second'
    ] = null;
```

Examples of **correct** code for this rule with the `{ bracketPropertyIndent: 4 }` option:
```js
root.first
    [
        'second'
    ].
     third = null;
```

Examples of **incorrect** code for this rule with the `{ bracketPropertyIndent: 2 }` option:
```js
root.first
    [
        'second'
    ] = null;
```

Examples of **correct** code for this rule with the `{ bracketPropertyIndent: 2 }` option:
```js
root.first
    [
      'second'
    ].
     third = null;
```