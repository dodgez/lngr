let expect = require('chai').expect;

let parser = require('./../src/parser');
let utils = require('./../src/utils');

describe('Parser', () => {
  describe('formats', () => {
    it('formats one rule', () => {
      let rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}]);

      expect(rules[0]).to.have.property('name', 'expression');
      expect(rules[0]).to.have.property('expr', 'BINARY_OP INTEGER INTEGER');
      expect(rules[0]).to.respondTo('parse');
    });

    it('formats dependent rules', () => {
      let rules = parser.formatRules([
        {name: 'statement', expr: 'ASSIGNMENT IDENTIFIER expression'},
        {name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'},
      ]);

      expect(rules[0]).to.have.property('name', 'statement');
      expect(rules[0]).to.have.property('expr', 'ASSIGNMENT IDENTIFIER expression');
      expect(rules[0]).to.respondTo('parse');
    });
  });

  describe('sample', () => {
    it('formats one rule', () => {
      let tokens = [
        {token: '+', type: 'BINARY_OP'},
        {token: '1', type: 'INTEGER'},
        {token: '1', type: 'INTEGER'},
      ]
      let node = new utils.ASTNode('expression', tokens.map(token => new utils.ASTNode(token.type, null, token.token)));
      let rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}]);

      expect(rules[0].parse(utils.getTokenStream(tokens))).to.deep.equal(node);
    });

    it('formats dependent rules', () => {
      let tokens = [
        {token: '=', type: 'ASSIGNMENT'},
        {token: 'a', type: 'IDENTIFIER'},
        {token: '+', type: 'BINARY_OP'},
        {token: '1', type: 'INTEGER'},
        {token: '1', type: 'INTEGER'}
      ]
      let node = new utils.ASTNode('statement', [
        new utils.ASTNode('ASSIGNMENT', null, '='),
        new utils.ASTNode('IDENTIFIER', null, 'a'),
        new utils.ASTNode('expression', [
          new utils.ASTNode('BINARY_OP', null, '+'),
          new utils.ASTNode('INTEGER', null, '1'),
          new utils.ASTNode('INTEGER', null, '1'),
        ]),
      ]);
      let rules = parser.formatRules([
        {name: 'statement', expr: 'ASSIGNMENT IDENTIFIER expression'},
        {name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'},
      ]);

      expect(rules[0].parse(utils.getTokenStream(tokens))).to.deep.equal(node);
    });
  });
});
