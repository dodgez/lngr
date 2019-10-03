
let tokens = [
  {
    name: "IDENTIFIER",
    expr: "LETTER+"
  },
  {
    name: "INTEGER",
    expr: "DIGIT+"
  },
  {
    name: "FLOAT",
    expr: "INTEGER\\.(INTEGER)?"
  },
  {
    name: "DIGIT",
    expr: "[0-9]"
  },
  {
    name: "LETTER",
    expr: "[a-zA-Z]"
  },
  {
    name: "WHITE",
    expr: "( |\t|\r|\n)+"
  }
];

for (let i = 0; i < tokens.length; ++i) {
  let token1 = tokens[i];

  for (let j = 0; j < tokens.length; ++j) {
    if (i == j) continue;
    let token2 = tokens[j];

    while (token1.expr.includes(token2.name)) token1.expr = token1.expr.replace(token2.name, token2.expr);
  }
}

tokens = tokens.map(token => {
  if (!token.expr.includes('^')) token.expr = '^' + token.expr;
  if (!token.expr.includes('$')) token.expr = token.expr + '$';
  return token;
});

function lex(tokens, string) {
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

console.log(lex(tokens, "123 123.4 abc"));
