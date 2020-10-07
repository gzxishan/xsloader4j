let {
	x,
	y,
	...z
} = {
	x: 1,
	y: 2,
	a: 3,
	b: 4
};
console.log(x); // 1
console.log(y); // 2
console.log(z); // { a: 3, b: 4 }

let n = {
	x,
	y,
	...z
};
console.log(n); // { x: 1, y: 2, a: 3, b: 4 }

export default z.a == 3 && z.b == 4 && n.x == 1 && n.a == 3 && n.b == 4;
