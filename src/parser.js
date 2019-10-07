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
        let one_or_more = expr.endsWith('+');
        if (expr.endsWith('*')) optional = one_or_more = true;
        let paranthesized = expr.includes('(') || expr.includes(')');
        let option_passed = false;

        if (optional || one_or_more || paranthesized) expr = expr.replace(/(\(|\)|\?|\+|\*)/g, '');

        let occurances = 0;
        do {
          for (let option of expr.split('|')) {
            let is_token = option.match(/^[A-Z]/) ? true : false;

            if (is_token) {
              if (stream.matchesToken(option)) {
                children.push(new utils.ASTNode(option, [], stream.peekToken()));
                stream.advance();
                option_passed = true;
                occurances++;
                break;
              }
            } else {
              let node = rules.filter(rule => rule.name == option)[0].parse(stream);

              if (node) {
                children.push(node);
                option_passed = true;
                occurances++;
                break;
              }
            }

            option_passed = false;
          }
        } while (one_or_more && option_passed && !stream.isEOF())

        if (!option_passed && !optional && (!one_or_more || (one_or_more && occurances == 0))) return null;
      }

      return new utils.ASTNode(rule.name, children);
    }

    return rule;
  });

  return rules;
}
