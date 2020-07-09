# ESLint Plugin Align

## Rules

[member-indent-align](docs/rules/member-indent-align.md)

## Planned Rules/Options

* align option for member-indent-align (first, last, first-same, last-same)

* operator-indent-align rule

* assignment-align rule

* function-expression-indent-align rule

## Notes

The project currently only supports linting source that uses space indentation.
To support linting source that uses tab indentation, it seems like a policy of using tabs as much as possible in fixes would have to be used.
This would result in leading tab indentation with trailing space indentation which does not seem ideal.