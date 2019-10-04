class StringStream {
  string;
  index;

  constructor(string) {
    this.string = string;
    this.index = 0;
  }

  peek() {
    return (this.index < this.string.length ? this.string[this.index] : null);
  }

  advance() {
    this.index++;
  }

  isEOF() {
    return (this.index >= this.string.length);
  }
}

class TokenStream {
  tokens;
  index;

  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  matchesToken(token_type) {
    if (this.isEOF()) return false;

    return this.tokens[this.index].type == token_type;
  }

  peekToken() {
    if (this.isEOF()) return false;

    return this.tokens[this.index].token;
  }

  advance() {
    this.index++;
  }

  isEOF() {
    return this.index >= this.tokens.length;
  }
}

class ASTNode {
  type;
  children;
  token;

  constructor(type, children, token = null) {
    this.type = type;
    this.children = children;
    this.token = token;
  }
}

module.exports.ASTNode = ASTNode;

module.exports.getStringStream = function(string) {
  return new StringStream(string);
}

module.exports.getTokenStream = function(tokens) {
  return new TokenStream(tokens);
}
