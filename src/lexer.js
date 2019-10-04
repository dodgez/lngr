module.exports.lex = function(tokens, stream) {
  let tokenized = [];
  let expr = "";
  let last_token = null;
  let char = null;

  while (!stream.isEOF()) {
    if (!char) char = stream.get();
    expr += char;
    char = null;

    let cur_token = null;

    for (token of tokens) {
      if (expr.match(token.expr)) {
        cur_token = token;
        break;
      }
    }

    if (!cur_token) {
      if (last_token) {
        char = expr[expr.length - 1];
        expr = expr.slice(0, expr.length - 1);
      }

      tokenized.push({
        token: expr,
        type: last_token ? last_token.name : last_token
      });
      expr = "";
    }

    last_token = cur_token;
  }

  tokenized.push({
    token: last_token ? expr : char,
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
    if (!token.expr.startsWith('^')) token.expr = '^' + token.expr;
    if (!token.expr.endsWith('$')) token.expr = token.expr + '$';
  });

  return tokens;
}
