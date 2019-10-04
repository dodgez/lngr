class StringStream {
  string;
  index;

  constructor(string) {
    this.string = string;
    this.index = 0;
  }

  get() {
    return (this.index < this.string.length ? this.string[this.index++] : null);
  }

  isEOF() {
    return (this.index >= this.string.length);
  }
}

module.exports.getStringStream = function(string) {
  return new StringStream(string);
}
