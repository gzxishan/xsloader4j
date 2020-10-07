function test(param =
	throw new Error('required!')) {
	const test = param === true ||
		throw new Error('Falsy!');
}

let a = false;
try {
	test();
} catch {
	a = true;
}

let b = false;
try {
	test(false);
} catch {
	b = true;
}

export default a && b;
