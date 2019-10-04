let utils = require('./utils');

module.exports.formatRules = function(raw_rules) {
  let rules = raw_rules.map(rule => Object.assign(Object.assign({}, rule), {
    parse: function() {}
  }));

  rules = rules.map(rule => {
    rule.parse = function(stream) {
      let children = []
      for (let expr of rule.expr.split(' ')) {
        let optional = expr.endsWith('?');
        let paranthesized = expr.includes('(') || expr.includes(')');
        let option_passed = false;

        if (optional || paranthesized) expr = expr.replace(/(\(|\)|\?)/g, '');

        for (let option of expr.split('|')) {
          let is_token = option.match(/^[A-Z]/) ? true : false;

          if (is_token) {
            if (stream.matchesToken(option)) {
              children.push(new utils.ASTNode(option, null, stream.peekToken()));
              stream.advance();
              option_passed = true;
              break;
            }
          } else {
            let node = rules.filter(rule => rule.name == option)[0].parse(stream);

            if (node) {
              children.push(node);
              option_passed = true;
              break;
            }
          }
        }

        if (!option_passed && !optional) return null;
      }

      return new utils.ASTNode(rule.name, children);
    }

    return rule;
  });

  return rules;
}
