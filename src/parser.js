let utils = require('./utils');

module.exports.parse = function(rules, stream) {
  let parsed = rules[0].parse(stream);
  
  if (!stream.isEOF()) {
    throw new Error(`Unexpected extra token '${stream.peekToken()}' line ${stream.peekLineInfo().line} col ${stream.peekLineInfo().col}`);
  }

  return parsed;
}

module.exports.formatRules = function(raw_rules) {
  let rules = raw_rules.map(rule => Object.assign(Object.assign({}, rule), {
    matches: function() {},
    parse: function() {}
  }));

  rules = rules.map(rule => {
    rule.matches = function(stream) {
      for (let expr of rule.expr.split(' ')) {
        let optional = expr.endsWith('?');
        let one_or_more = expr.endsWith('+');
        if (expr.endsWith('*')) optional = one_or_more = true;
        let paranthesized = expr.includes('(') || expr.includes(')');
        let option_passed = false;

        if (optional || one_or_more || paranthesized) expr = expr.replace(/(\(|\)|\?|\+|\*)/g, '');

        for (let option of expr.split('|')) {
          let is_token = option.match(/^[A-Z]/) ? true : false;

          if (is_token) {
            if (stream.matchesToken(option)) {
              return true;
            }
          } else {
            let matches = rules.filter(rule => rule.name == option)[0].matches(stream);

            if (matches) {
              return true;
            }
          }

          option_passed = false;
        }

        if (!option_passed && !optional) return false;
      }

      return false;
    }

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
              let option_rule = rules.find(rule => rule.name == option);
              
              if (option_rule.matches(stream)) {
                let node = option_rule.parse(stream);
                if (!option_rule.squash) {
                  children.push(node);
                } else {
                  children = children.concat(node.children);
                }
                option_passed = true;
                occurances++;
                break;
              }
            }

            option_passed = false;
          }
        } while (one_or_more && option_passed && !stream.isEOF())

        if (!option_passed && !optional && (!one_or_more || (one_or_more && occurances == 0))) {
          if (stream.isEOF()) {
            throw new Error(`Error when parsing '${rule.name}'.` +
              ` Expected to find '${expr}' but found 'EOF'`);
          } else {
            throw new Error(`Unexpected token when parsing '${rule.name}'.` +
              ` Expected to find '${expr}' but found '${stream.peekToken()}'` +
              ` Line: ${stream.peekLineInfo().line} Column: ${stream.peekLineInfo().col}`);
          }
        }
      }

      return new utils.ASTNode(rule.name, children);
    }

    return rule;
  });

  return rules;
}
