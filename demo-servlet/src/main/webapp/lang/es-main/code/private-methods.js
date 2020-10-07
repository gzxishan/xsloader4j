class Counter{
  #xValue = 0;

  get #x() { return this.#xValue; }
  set #x(value) {
    this.#xValue = value;
  }

  #clicked() {
    this.#x++;
  }
}

let counter=new Counter();

console.log(counter);

export default true;