let a = true;
let b = false;
let c = true;
let obj = {
	a: {
		b: true
	}
}

a ||= b;
obj.a.b ||= c;

a &&= b;
obj.a.b &&= c;

export default true;
