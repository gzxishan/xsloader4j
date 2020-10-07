function test(x = "hello", {
	a,
	b
}, ...args) {
	console.log(x, a, b, args);
	return {
		x,
		a,
		b,
		args
	}
}

let result = test(undefined, {
	a: "A",
	b: "B",
	c: "C"
}, "D", "E", ["F", "G"], {
	h: "H",
	i: "I"
});
console.log(result);

export default result.x == "hello" && result.a == "A" && result.args[0] == "D";
