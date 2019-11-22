const chai = require('chai');
const chaiExclude = require('chai-exclude');

const parser = require('./../src/parser');
const utils = require('./../src/utils');

const expect = chai.expect;
chai.use(chaiExclude);

describe('Parser', function() {
  describe('formats', function() {
    it('formats one rule', function() {
      const rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}]);

      expect(rules[0]).to.have.property('name', 'expression');
      expect(rules[0]).to.have.property('expr', 'BINARY_OP INTEGER INTEGER');
      expect(rules[0]).to.respondTo('parse');
    });

    it('formats dependent rules', function() {
      const rules = parser.formatRules([
        {name: 'statement', expr: 'ASSIGNMENT IDENTIFIER expression'},
        {name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}
      ]);

      expect(rules[0]).to.have.property('name', 'statement');
      expect(rules[0]).to.have.property('expr', 'ASSIGNMENT IDENTIFIER expression');
      expect(rules[0]).to.respondTo('parse');
    });
  });

  describe('matches', function() {
    it('a direct token', function() {
      // const tokens = [{token: '+', type: 'BINARY_OP'}];
      // const rules = parser.testFormatRules([{name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}]);

      // expect(rules[0].matches(utils.getTokenStream(tokens))).to.be.equal(true);
    });

    it('an indirect token', function() {
      // const tokens = [{token: 'asdf', type: 'IDENTIFIER'}];
      // const rules = parser.testFormatRules(
      //   [
      //     {name: 'statement', expr: 'type IDENTIFIER'},
      //     {name: 'type', expr: 'IDENTIFIER'},
      //   ]
      // );

      // expect(rules[0].matches(utils.getTokenStream(tokens))).to.be.equal(true);
    });
  });

  describe('sample', function() {
    it('parses one rule', function() {
      const tokens = [
        {token: '+', type: 'BINARY_OP', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1},
      ];
      const node = new utils.ASTNode('expression', tokens.map(token => new utils.ASTNode(token.type, [], token.token)));
      const rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);
    });

    it('parses an OR rule', function() {
      const tokens = [
        {token: '+', type: 'BINARY_OP', line: 1, col: 1},
        {token: 'a', type: 'IDENTIFIER', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1}
      ];
      const node = new utils.ASTNode('expression', tokens.map(token => new utils.ASTNode(token.type, [], token.token)));
      const rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER|IDENTIFIER INTEGER'}]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);
    });

    it('parses a recursive rule', function() {
      const tokens = [
        {token: '+', type: 'BINARY_OP', line: 1, col: 1},
        {token: '+', type: 'BINARY_OP', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 2, col: 1},
        {token: 'a', type: 'IDENTIFIER', line: 2, col: 1}
      ];
      const node = new utils.ASTNode('expression', [
        new utils.ASTNode('BINARY_OP', [], '+'),
        new utils.ASTNode('expression', [
          new utils.ASTNode('BINARY_OP', [], '+'),
          new utils.ASTNode('INTEGER', [], '1'),
          new utils.ASTNode('INTEGER', [], '1')
        ]),
        new utils.ASTNode('IDENTIFIER', [], 'a')
      ]);
      const rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER|IDENTIFIER|expression INTEGER|IDENTIFIER|expression'}]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);
    });

    it('parses a deeper recursive rule', function() {
      const tokens = [
        {token: '+', type: 'BINARY_OP', line: 1, col: 1},
        {token: '+', type: 'BINARY_OP', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1},
        {token: 'a', type: 'IDENTIFIER', line: 1, col: 1},
        {token: '+', type: 'BINARY_OP', line: 1, col: 1},
        {token: 'a', type: 'IDENTIFIER', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1}
      ];
      const node = new utils.ASTNode('expression', [
        new utils.ASTNode('BINARY_OP', [], '+'),
        new utils.ASTNode('expression', [
          new utils.ASTNode('BINARY_OP', [], '+'),
          new utils.ASTNode('INTEGER', [], '1'),
          new utils.ASTNode('IDENTIFIER', [], 'a')
        ]),
        new utils.ASTNode('expression', [
          new utils.ASTNode('BINARY_OP', [], '+'),
          new utils.ASTNode('IDENTIFIER', [], 'a'),
          new utils.ASTNode('INTEGER', [], '1')
        ])
      ]);
      const rules = parser.formatRules([{name: 'expression', expr: 'BINARY_OP INTEGER|IDENTIFIER|expression INTEGER|IDENTIFIER|expression'}]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);
    });

    it('parses dependent rules', function() {
      const tokens = [
        {token: '=', type: 'ASSIGNMENT', line: 1, col: 1},
        {token: 'a', type: 'IDENTIFIER', line: 1, col: 1},
        {token: '+', type: 'BINARY_OP', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1}
      ];
      const node = new utils.ASTNode('statement', [
        new utils.ASTNode('ASSIGNMENT', [], '='),
        new utils.ASTNode('IDENTIFIER', [], 'a'),
        new utils.ASTNode('expression', [
          new utils.ASTNode('BINARY_OP', [], '+'),
          new utils.ASTNode('INTEGER', [], '1'),
          new utils.ASTNode('INTEGER', [], '1')
        ])
      ]);
      const rules = parser.formatRules([
        {name: 'statement', expr: 'ASSIGNMENT IDENTIFIER expression'},
        {name: 'expression', expr: 'BINARY_OP INTEGER INTEGER'}
      ]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);
    });

    it('parses rules with optional arguments', function() {
      let tokens = [
        {token: '+', type: 'OPERATOR', line: 1, col: 1},
        {token: 'a', type: 'IDENTIFIER', line: 1, col: 1}
      ];
      let node = new utils.ASTNode('expression', [
        new utils.ASTNode('OPERATOR', [], '+'),
        new utils.ASTNode('IDENTIFIER', [], 'a')
      ]);
      const rules = parser.formatRules([
        {name: 'expression', expr: 'OPERATOR INTEGER|IDENTIFIER (INTEGER|IDENTIFIER)?'}
      ]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);

      tokens = [
        {token: '+', type: 'OPERATOR', line: 1, col: 1},
        {token: 'a', type: 'IDENTIFIER', line: 1, col: 1},
        {token: 'a', type: 'IDENTIFIER', line: 1, col: 1}
      ];
      node = new utils.ASTNode('expression', [
        new utils.ASTNode('OPERATOR', [], '+'),
        new utils.ASTNode('IDENTIFIER', [], 'a'),
        new utils.ASTNode('IDENTIFIER', [], 'a')
      ]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);
    });

    it('parses rules with one-or-more type arguments', function() {
      let tokens = [
        {token: 'print', type: 'PRINT', line: 1, col: 1}
      ];
      const rules = parser.formatRules([
        {name: 'print', expr: 'PRINT (INTEGER|IDENTIFIER)+'}
      ]);

      expect(parser.parse.bind(null, rules, utils.getTokenStream(tokens))).to.throw("Error when parsing 'print'. Expected to find 'INTEGER|IDENTIFIER' but found 'EOF'");

      tokens = [
        {token: 'print', type: 'PRINT', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1}
      ];
      node = new utils.ASTNode('print', [
        new utils.ASTNode('PRINT', [], 'print'),
        new utils.ASTNode('INTEGER', [], '1')
      ]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);

      tokens = [
        {token: 'print', type: 'PRINT', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1},
        {token: 'a', type: 'IDENTIFIER', line: 1, col: 1}
      ];
      node = new utils.ASTNode('print', [
        new utils.ASTNode('PRINT', [], 'print'),
        new utils.ASTNode('INTEGER', [], '1'),
        new utils.ASTNode('IDENTIFIER', [], 'a')
      ]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);
    });

    it('parses rules with zero-or-more type arguments', function() {
      let tokens = [
        {token: '(', type: 'LPAREN', line: 1, col: 1},
        {token: ')', type: 'RPAREN', line: 1, col: 1}
      ];
      let node = new utils.ASTNode('call', [
        new utils.ASTNode('LPAREN', [], '('),
        new utils.ASTNode('RPAREN', [], ')')
      ]);
      const rules = parser.formatRules([
        {name: 'call', expr: 'LPAREN (INTEGER)* RPAREN'}
      ]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);

      tokens = [
        {token: '(', type: 'LPAREN', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1},
        {token: ')', type: 'RPAREN', line: 1, col: 1}
      ];
      node = new utils.ASTNode('call', [
        new utils.ASTNode('LPAREN', [], '('),
        new utils.ASTNode('INTEGER', [], '1'),
        new utils.ASTNode('RPAREN', [], ')')
      ]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);

      tokens = [
        {token: '(', type: 'LPAREN', line: 1, col: 1},
        {token: '1', type: 'INTEGER', line: 1, col: 1},
        {token: '2', type: 'INTEGER', line: 1, col: 1},
        {token: ')', type: 'RPAREN', line: 1, col: 1}
      ];
      node = new utils.ASTNode('call', [
        new utils.ASTNode('LPAREN', [], '('),
        new utils.ASTNode('INTEGER', [], '1'),
        new utils.ASTNode('INTEGER', [], '2'),
        new utils.ASTNode('RPAREN', [], ')')
      ]);

      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);
    });

    it('throws an error for extra tokens', function() {
      const tokens = [
        {token: '1', type: 'INTEGER', line: 2, col: 1},
        {token: 'test', type: 'ID', line: 3, col: 4}
      ];
      const rules = parser.formatRules([
        {name: 'program', expr: 'INTEGER+'}
      ]);

      expect(parser.parse.bind(null, rules, utils.getTokenStream(tokens))).to.throw("Unexpected extra token 'test' line 3 col 4");
    });

    it('squashes unnecessary nested tokens', function() {
      const tokens = [
        {token: 'test', type: 'IDENTIFIER', line: 1, col: 1},
        {token: 'case', type: 'IDENTIFIER', line: 1, col: 5}
      ];
      const rules = parser.formatRules([
        {name: 'tree', expr: "unnecessary"},
        {name: 'unnecessary', expr: "(IDENTIFIER)*", squash: true}
      ]);

      node = new utils.ASTNode('tree', [
        new utils.ASTNode('IDENTIFIER', [], 'test'),
        new utils.ASTNode('IDENTIFIER', [], 'case')
      ]);
      expect(parser.parse(rules, utils.getTokenStream(tokens))).excludingEvery('parent').to.deep.equal(node);
    });

    it('calls a start callback', function() {
      const nodes_reached = [];
      const tokens = [{token: 'test', type: 'IDENTIFIER', line: 1, col: 1}];
      const rules = parser.formatRules([{name: 'program', expr: 'IDENTIFIER'}]);

      parser.parse(rules, utils.getTokenStream(tokens), function(type) {
        nodes_reached.push(type);
      });

      expect(nodes_reached).excludingEvery('parent').to.deep.equal(['program', 'IDENTIFIER']);
    });

    it('calls an end callback', function() {
      const nodes_reached = [];
      const tokens = [{token: 'test', type: 'IDENTIFIER', line: 1, col: 1}];
      const rules = parser.formatRules([{name: 'program', expr: 'IDENTIFIER'}]);
      const nodes = [
        new utils.ASTNode('IDENTIFIER', [], 'test'),
        new utils.ASTNode('program', [new utils.ASTNode('IDENTIFIER', [], 'test')])
      ];

      parser.parse(rules, utils.getTokenStream(tokens), (type) => {}, function(node) {
        nodes_reached.push(node);
      });

      expect(nodes_reached).excludingEvery('parent').to.deep.equal(nodes);
    });
  });
});
