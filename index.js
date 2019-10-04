
let lexer = require('./src/lexer');
let fs = require('fs');
let utils = require('./src/utils');

let grammar = JSON.parse(fs.readFileSync('./src/sample_grammar.json', 'utf8'));
let tokens = grammar.tokens;

console.log(lexer.lex(lexer.formatTokens(tokens), utils.getStringStream(".123... 123.4 abc.")));
