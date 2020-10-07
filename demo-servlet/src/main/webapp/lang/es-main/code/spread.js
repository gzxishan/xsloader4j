let a = ['a', 'b', 'c'];

let b = [...a, 'foo'];

export default b[0] == "a" && b[4] == "foo";
