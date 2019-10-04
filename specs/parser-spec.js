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
        {name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}
      ]);

      expect(rules[0]).to.have.property('name', 'statement');
      expect(rules[0]).to.have.property('expr', 'ASSIGNMENT IDENTIFIER expression');
      expect(rules[0]).to.respondTo('parse');
    });
  });

  describe('sample', () => {
    it('parses one rule', () => {
      let tokens = [
        {token: '+', type: 'BINARY_OP'},
        {token: '1', type: 'INTEGER'},
        {token: '1', type: 'INTEGER'},
      ]
      let node = new utils.ASTNode('expression', tokens.map(token => new utils.ASTNode(token.type, null, token.token)));
      let rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}]);

      expect(rules[0].parse(utils.getTokenStream(tokens))).to.deep.equal(node);
    });

    it('parses an OR rule', () => {
      let tokens = [
        {token: '+', type: 'BINARY_OP'},
        {token: 'a', type: 'IDENTIFIER'},
        {token: '1', type: 'INTEGER'}
      ];
      let node = new utils.ASTNode('expression', tokens.map(token => new utils.ASTNode(token.type, null, token.token)));
      let rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER|IDENTIFIER INTEGER'}]);

      expect(rules[0].parse(utils.getTokenStream(tokens))).to.deep.equal(node);
    });

    it('parses a recursive rule', () => {
      let tokens = [
        {token: '+', type: 'BINARY_OP'},
        {token: '+', type: 'BINARY_OP'},
        {token: '1', type: 'INTEGER'},
        {token: '1', type: 'INTEGER'},
        {token: 'a', type: 'IDENTIFIER'}
      ];
      let node = new utils.ASTNode('expression', [
        new utils.ASTNode('BINARY_OP', null, '+'),
        new utils.ASTNode('expression', [
          new utils.ASTNode('BINARY_OP', null, '+'),
          new utils.ASTNode('INTEGER', null, '1'),
          new utils.ASTNode('INTEGER', null, '1')
        ]),
        new utils.ASTNode('IDENTIFIER', null, 'a')
      ]);
      let rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER|IDENTIFIER|expression INTEGER|IDENTIFIER|expression'}]);

      expect(rules[0].parse(utils.getTokenStream(tokens))).to.deep.equal(node);
    });

    it('parses a deeper recursive rule', () => {
      let tokens = [
        {token: '+', type: 'BINARY_OP'},
        {token: '+', type: 'BINARY_OP'},
        {token: '1', type: 'INTEGER'},
        {token: 'a', type: 'IDENTIFIER'},
        {token: '+', type: 'BINARY_OP'},
        {token: 'a', type: 'IDENTIFIER'},
        {token: '1', type: 'INTEGER'}
      ];
      let node = new utils.ASTNode('expression', [
        new utils.ASTNode('BINARY_OP', null, '+'),
        new utils.ASTNode('expression', [
          new utils.ASTNode('BINARY_OP', null, '+'),
          new utils.ASTNode('INTEGER', null, '1'),
          new utils.ASTNode('IDENTIFIER', null, 'a')
        ]),
        new utils.ASTNode('expression', [
          new utils.ASTNode('BINARY_OP', null, '+'),
          new utils.ASTNode('IDENTIFIER', null, 'a'),
          new utils.ASTNode('INTEGER', null, '1')
        ])
      ]);
      let rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER|IDENTIFIER|expression INTEGER|IDENTIFIER|expression'}]);

      expect(rules[0].parse(utils.getTokenStream(tokens))).to.deep.equal(node);
    });

    it('parses dependent rules', () => {
      let tokens = [
        {token: '=', type: 'ASSIGNMENT'},
        {token: 'a', type: 'IDENTIFIER'},
        {token: '+', type: 'BINARY_OP'},
        {token: '1', type: 'INTEGER'},
        {token: '1', type: 'INTEGER'}
      ];
      let node = new utils.ASTNode('statement', [
        new utils.ASTNode('ASSIGNMENT', null, '='),
        new utils.ASTNode('IDENTIFIER', null, 'a'),
        new utils.ASTNode('expression', [
          new utils.ASTNode('BINARY_OP', null, '+'),
          new utils.ASTNode('INTEGER', null, '1'),
          new utils.ASTNode('INTEGER', null, '1')
        ])
      ]);
      let rules = parser.formatRules([
        {name: 'statement', expr: 'ASSIGNMENT IDENTIFIER expression'},
        {name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}
      ]);

      expect(rules[0].parse(utils.getTokenStream(tokens))).to.deep.equal(node);
    });

    it('parses rules with optional arguments', () => {
      let tokens = [
        {token: '+', type: 'OPERATOR'},
        {token: 'a', type: 'IDENTIFIER'}
      ];
      let node = new utils.ASTNode('expression', [
        new utils.ASTNode('OPERATOR', null, '+'),
        new utils.ASTNode('IDENTIFIER', null, 'a')
      ]);
      let rules = parser.formatRules([
        {name: 'expression', expr: 'OPERATOR INTEGER|IDENTIFIER (INTEGER|IDENTIFIER)?'}
      ]);

      expect(rules[0].parse(utils.getTokenStream(tokens))).to.deep.equal(node);
    });
  });
});
