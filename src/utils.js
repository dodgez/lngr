class StringStream {
  constructor(string) {
    this.string = string;
    this.index = 0;
    this.line = 1;
    this.col = 1;

    if (this.peek() === '\n') {
      this.line = 2;
    }
  }

  peek() {
    return (this.index < this.string.length ? this.string[this.index] : null);
  }

  advance() {
    this.index++;
    if (!this.isEOF()) {
      if (this.peek() === '\n') {
        this.line += 1;
        this.col = 1;
      }
    }
  }

  isEOF() {
    return (this.index >= this.string.length);
  }
}

class TokenStream {
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

  peekLineInfo() {
    if (this.isEOF()) return false;

    return {
      line: this.tokens[this.index].line,
      col: this.tokens[this.index].col
    };
  }

  advance() {
    this.index++;
  }

  isEOF() {
    return this.index >= this.tokens.length;
  }
}

class ASTNode {
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
