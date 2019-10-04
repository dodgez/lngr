module.exports.lex = function(tokens, string) {
  let tokenized = [];
  let expr = "";
  let last_token = null;

  for (let i = 0; i < string.length; ++i) {
    expr += string[i];

    let cur_token = null;

    for (token of tokens) {
      if (expr.match(token.expr)) {
        cur_token = token;
        break;
      }
    }

    if (!cur_token) {
      tokenized.push({
        token: expr.slice(0, expr.length - 1),
        type: last_token ? last_token.name : last_token
      });
      expr = "";
      if (!last_token) continue;
      i -= 1;
    }
    last_token = cur_token;
  }

  tokenized.push({
    token: expr.slice(0, expr.length),
    type: last_token ? last_token.name : last_token
  });

  return tokenized;
}

module.exports.formatTokens = function(raw_tokens) {
  let tokens = raw_tokens.map(token => Object.assign({}, token));

  for (token1 of tokens) {
    for (token2 of tokens) {
      while (token1.expr.includes(token2.name)) token1.expr = token1.expr.replace(token2.name, token2.expr);
    }
  }

  tokens.forEach(token => {
    if (!token.expr.includes('^')) token.expr = '^' + token.expr;
    if (!token.expr.includes('$')) token.expr = token.expr + '$';
  });

  return tokens;
}
