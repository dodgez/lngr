module.exports.lex = function(tokens, stream) {
  const tokenized = [];
  let expr = "";
  let last_token = null;

  while (!stream.isEOF()) {
    expr += stream.peek();

    let cur_token = null;

    for (const token of tokens) {
      if (expr.match(token.expr)) {
        cur_token = token;
        break;
      }
    }

    if (!cur_token) {
      if (last_token) {
        if (!last_token.ignore) {
          tokenized.push({
            token: expr.slice(0, expr.length - 1),
            type: last_token.name,
            line: stream.line,
            col: stream.col
          });
        }
        expr = "";
        last_token = cur_token;
        continue;
      } else {
        throw new Error(`Unrecognized token '${expr}'.` +
          ` Line: ${stream.line} Column: ${stream.col}`);
      }
    }
    
    stream.advance();
    last_token = cur_token;
  }

  if (last_token && !last_token.ignore) {
    tokenized.push({
      token: expr,
      type: last_token ? last_token.name : last_token,
      line: stream.line,
      col: stream.col
    });
  }

  return tokenized;
}

module.exports.formatTokens = function(raw_tokens) {
  const tokens = raw_tokens.map(token => Object.assign({}, token));

  for (const token1 of tokens) {
    for (const token2 of tokens) {
      while (token1.expr.includes(token2.name)) token1.expr = token1.expr.replace(token2.name, token2.expr);
    }
  }

  tokens.forEach(token => {
    if (!token.expr.startsWith('^')) token.expr = '^' + token.expr;
    if (!token.expr.endsWith('$') || token.expr.endsWith('\\$')) token.expr = token.expr + '$';
  });

  return tokens;
}
