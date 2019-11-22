const utils = require('./utils');

module.exports.parse = function(rules, stream, start_callback=()=>{}, end_callback=(node)=>{}) {
  const parsed = rules[0].parse(stream, start_callback, end_callback);
  
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
        const paranthesized = expr.includes('(') || expr.includes(')');
        let option_passed = false;

        if (optional || one_or_more || paranthesized) expr = expr.replace(/(\(|\)|\?|\+|\*)/g, '');

        for (const option of expr.split('|')) {
          const is_token = option.match(/^[A-Z]/) ? true : false;

          if (is_token) {
            if (stream.matchesToken(option)) {
              return true;
            }
          } else {
            const matches = rules.filter(rule => rule.name == option)[0].matches(stream);

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

    rule.parse = function(stream, start_callback, end_callback) {
      start_callback(rule.name);
      let children = [];
      const returned_node = new utils.ASTNode(rule.name, children);
      for (let expr of rule.expr.split(' ')) {
        let optional = expr.endsWith('?');
        let one_or_more = expr.endsWith('+');
        if (expr.endsWith('*')) optional = one_or_more = true;
        const paranthesized = expr.includes('(') || expr.includes(')');
        let option_passed = false;

        if (optional || one_or_more || paranthesized) expr = expr.replace(/(\(|\)|\?|\+|\*)/g, '');

        let occurances = 0;
        do {
          for (const option of expr.split('|')) {
            const is_token = option.match(/^[A-Z]/) ? true : false;

            if (is_token) {
              if (stream.matchesToken(option)) {
                start_callback(option);
                const node = new utils.ASTNode(option, [], stream.peekToken());
                node.parent = returned_node;
                end_callback(node);
                children.push(node);
                stream.advance();
                option_passed = true;
                occurances++;
                break;
              }
            } else {
              const option_rule = rules.find(rule => rule.name == option);
              
              if (option_rule.matches(stream)) {
                const node = option_rule.parse(stream, start_callback, end_callback);
                node.parent = returned_node;
                if (!option_rule.squash) {
                  children.push(node);
                } else {
                  children = children.concat(node.children);
                  returned_node.children = children;
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

      end_callback(returned_node);
      return returned_node;
    }

    return rule;
  });

  return rules;
}
