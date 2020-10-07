let string = "foo💩bar";
let match = string.match(/foo(.)bar/u);

console.log(match);

export default match[1]=="💩";