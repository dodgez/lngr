
let tokens = [
  {
    name: "WORD",
    expr: "LETTER+"
  },
  {
    name: "LETTER",
    expr: "[a-zA-Z]"
  },
  {
    name: "NUM",
    expr: "DIGIT+"
  },
  {
    name: "DIGIT",
    expr: "[0-9]"
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

    token1.expr = token1.expr.replace(token2.name, token2.expr);
  }
}

tokens = tokens.map(token => {
  token.expr = '^' + token.expr + '$';
  return token;
});

function lex(string) {
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
      tokenized.push(last_token.name);
      expr = "";
      if (!last_token) continue;
      i -= 1;
    }
    last_token = cur_token;
  }

  tokenized.push(last_token.name);

  return tokenized;
}

console.log(lex("1234 abc"))
