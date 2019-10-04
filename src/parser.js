let utils = require('./utils');

module.exports.formatRules = function(raw_rules) {
  let rules = raw_rules.map(rule => Object.assign(Object.assign({}, rule), {
    parse: function() {}
  }));

  rules = rules.map(rule => {
    rule.parse = function(stream) {
      let options = rule.expr.split('|');
      for (let option of options.map(option => option.trim())) {
        let exprs = option.split(' ');
        let children = [];
        let passed = true;

        for (let expr of exprs) {
          let is_token = expr.match(/^[A-Z]/) ? true : false;
          
          if (is_token) {
            if (stream.matchesToken(expr)) {
              children.push(new utils.ASTNode(expr, null, stream.peekToken()));
              stream.advance()
            } else {
              passed = false;
              break;
            }
          } else {
            let node = rules.filter(rule => rule.name == expr)[0].parse(stream);

            if (node) {
              children.push(node);
            } else {
              passed = false;
              break;
            }
          }
        }

        if (passed) return new utils.ASTNode(rule.name, children);
      }

      return null;
    }

    return rule;
  });

  return rules;
}
