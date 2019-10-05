# lngr

This library provides functions for lexing and parsing a grammar based on a definition file (see [sample_grammar.json](https://github.com/dodgez/lngr/blob/master/sample_grammar.json)).

Currently a lexer and parser are functional.
The parser supports rules that reference other rules and tokens.
The basic syntax for rules is rules or tokens separated by spaces.

For parsing, to specify one token/rule or another, use '|' like `OPERATION INTEGER|IDENTIFIER INTEGER|IDENTIFIER`.
To specify optional, one-or-more, or zero-or-more of a token/rule (or a list of possible tokens/rules), use '?', '+', '*' and respectively like `OPERATION (INTEGER|IDENTIFIER)?`, `OPERATION (INTEGER|IDENTIFIER)+`, and `OPERATION (INTEGER|IDENTIFIER)*`.
