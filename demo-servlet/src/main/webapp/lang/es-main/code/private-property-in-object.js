class Foo {
  #bar = "bar";

  test() {
    return this.#bar;
  }
}

let foo = new Foo();

export default foo.test()=="bar";