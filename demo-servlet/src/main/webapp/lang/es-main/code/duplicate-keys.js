let x = {
	a: 5,
	a: 6
};
let y = {
	get a() {return 2;},
	set a(x) {},
	a: 3,
};

export default x.a == 6 && y.a == 3;
