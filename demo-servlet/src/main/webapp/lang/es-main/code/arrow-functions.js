let a = () => {};

const double = [1,2,3].map((num) => num * 2);
console.log(double); // [2,4,6]

let bob = {
  _name: "Bob",
  _friends: ["Sally", "Tom"],
  printFriends() {
    this._friends.forEach(f =>
      console.log(this._name + " knows " + f));
  }
};
console.log(bob.printFriends());

export default true;