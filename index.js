
let lexer = require('./lexer');
let fs = require('fs');

let grammar = JSON.parse(fs.readFileSync('./sample_grammar.json', 'utf8'));
let tokens = grammar.tokens;

console.log(lexer.lex(lexer.formatTokens(tokens), "123 123.4 abc"));
