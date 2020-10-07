let obj = {
	x: "X",
	y: "Y",
	z: "Z"
};

let arr = ["A", "B", "C", "D"];

let {
	x,
	y
} = obj;

let [a, b, ...rest] = arr;

export default x == "X" && y == "Y" && a == "A" && b == "B" && rest.length == 2;
