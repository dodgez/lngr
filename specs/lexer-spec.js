let expect = require('chai').expect;
let fs = require('fs');

let lexer = require('./../src/lexer');
let utils = require('./../src/utils');

describe('Lexer', function() {
  describe('formats', function() {
    it('formats one token', function() {
      expect(lexer.formatTokens([{name: 'INTEGER', expr: '[0-9]+'}])).to.deep.equal(
        [{name: 'INTEGER', expr: '^[0-9]+$'}]
      );
    });

    it('formats independent tokens', function() {
      expect(lexer.formatTokens([
        {name: 'INTEGER', expr: '[0-9]+'},
        {name: 'WHITESPACE', expr: '( |\t|\r|\n)+'}
      ])).to.deep.equal([
        {name: 'INTEGER', expr: '^[0-9]+$'},
        {name: 'WHITESPACE', expr: '^( |\t|\r|\n)+$'}
      ]);
    });

    it('formats two simple dependent tokens', function() {
      expect(lexer.formatTokens([
        {name: 'INTEGER', expr: '[0-9]+'},
        {name: 'INTEGER2', expr: 'INTEGER\\.'}
      ])).to.deep.equal([
        {name: 'INTEGER', expr: '^[0-9]+$'},
        {name: 'INTEGER2', expr: '^[0-9]+\\.$'}
      ]);
    });

    it('formats two dependent tokens', function() {
      expect(lexer.formatTokens([
        {name: 'INTEGER', expr: '[0-9]+'},
        {name: 'FLOAT', expr: 'INTEGER\\.(INTEGER)?'}
      ])).to.deep.equal([
        {name: 'INTEGER', expr: '^[0-9]+$'},
        {name: 'FLOAT', expr: '^[0-9]+\\.([0-9]+)?$'}
      ]);
    });

    it('formats a token with a $ in it', function() {
      expect(lexer.formatTokens([
        {name: 'DOLLARSIGN', expr: '\\$'}
      ])).to.deep.equal([
        {name: 'DOLLARSIGN', expr: '^\\$$'}
      ]);
    });
  });

  describe('sample', function() {
    let tokens;

    before(function() {
      let grammar = JSON.parse(fs.readFileSync('./sample_grammar.json', 'utf8'));
      tokens = lexer.formatTokens(grammar.tokens);
    });

    it('lexes a character', function() {
      expect(lexer.lex(tokens, utils.getStringStream('a'))).to.deep.equal(
        [{token: 'a', type: 'IDENTIFIER', line: 0, col: 0}]
      );
    });

    it('lexes integers', function() {
      expect(lexer.lex(tokens, utils.getStringStream('123'))).to.deep.equal(
        [{token: '123', type: 'INTEGER', line: 0, col: 0}]
      );
    });

    it('lexes floats', function() {
      expect(lexer.lex(tokens, utils.getStringStream('12.3'))).to.deep.equal(
        [{token: '12.3', type: 'FLOAT', line: 0, col: 0}]
      );

      expect(lexer.lex(tokens, utils.getStringStream('123.'))).to.deep.equal(
        [{token: '123.', type: 'FLOAT', line: 0, col: 0}]
      );

      expect(lexer.lex.bind(null, tokens, utils.getStringStream('.123'))).to.throw('Unrecognized token \'.\'. Line: 0 Column: 0');
    });

    it('lexes multiple types', function() {
      expect(lexer.lex(tokens, utils.getStringStream('12.3 123 abc'))).to.deep.equal(
        [
          {token: '12.3', type: 'FLOAT', line: 0, col: 0},
          {token: '123', type: 'INTEGER', line: 0, col: 0},
          {token: 'abc', type: 'IDENTIFIER', line: 0, col: 0},
        ]
      );
    });

    it('lexes a single character ending token', function() {
      expect(lexer.lex(tokens, utils.getStringStream(' 2'))).to.deep.equal(
        [
          {token: '2', type: 'INTEGER', line: 0, col: 0}
        ]
      );
    });

    it('throws an error for unknown token', function() {
      expect(lexer.lex.bind(null, tokens, utils.getStringStream('|'))).to.throw("Unrecognized token \'|\'. Line: 0 Column: 0");

      expect(lexer.lex.bind(null, tokens, utils.getStringStream('\n|'))).to.throw("Unrecognized token \'|\'. Line: 1 Column: 0");
    });
  });
});
