let a = false,
	b = false,
	c = false;

try {
	throw 0;
} catch {
	a = true;
}

try {
	throw 0;
} catch {
	b = true;
} finally {
	c = true;
}

export default a && b && c;
