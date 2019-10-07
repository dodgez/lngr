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
  });

  describe('sample', function() {
    let tokens;

    before(function() {
      let grammar = JSON.parse(fs.readFileSync('./sample_grammar.json', 'utf8'));
      tokens = lexer.formatTokens(grammar.tokens);
    });

    it('lexes a character', function() {
      expect(lexer.lex(tokens, utils.getStringStream('a'))).to.deep.equal(
        [{token: 'a', type: 'IDENTIFIER'}]
      );
    });

    it('lexes integers', function() {
      expect(lexer.lex(tokens, utils.getStringStream('123'))).to.deep.equal(
        [{token: '123', type: 'INTEGER'}]
      );
    });

    it('lexes floats', function() {
      expect(lexer.lex(tokens, utils.getStringStream('12.3'))).to.deep.equal(
        [{token: '12.3', type: 'FLOAT'}]
      );

      expect(lexer.lex(tokens, utils.getStringStream('123.'))).to.deep.equal(
        [{token: '123.', type: 'FLOAT'}]
      );

      expect(lexer.lex(tokens, utils.getStringStream('.123'))).to.deep.equal(
        [
          {token: '.', type: null},
          {token: '123', type: 'INTEGER'}
        ]
      );
    });

    it('lexes multiple types', function() {
      expect(lexer.lex(tokens, utils.getStringStream('12.3 123 abc'))).to.deep.equal(
        [
          {token: '12.3', type: 'FLOAT'},
          {token: '123', type: 'INTEGER'},
          {token: 'abc', type: 'IDENTIFIER'},
        ]
      );
    });

    it('lexes a single character ending token', function() {
      expect(lexer.lex(tokens, utils.getStringStream(' 2'))).to.deep.equal(
        [
          {token: '2', type: 'INTEGER'}
        ]
      );
    });

    it('lexes a single character ending token after an unknown', function() {
      expect(lexer.lex(tokens, utils.getStringStream('|2'))).to.deep.equal(
        [
          {token: '|', type: null},
          {token: '2', type: 'INTEGER'}
        ]
      );
    });

    it('lexes an unknown starting character', function() {
      expect(lexer.lex(tokens, utils.getStringStream('|'))).to.deep.equal(
        [{token: '|', type: null}]
      );
    });
  });
});
