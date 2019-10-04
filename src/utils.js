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

module.exports.getStringStream = function(string) {
  return new StringStream(string);
}
