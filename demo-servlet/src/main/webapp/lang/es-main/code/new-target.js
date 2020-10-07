function Foo() {
	let target = new.target;
	console.log(new.target);

	if (this) {
		this.getTarget = function() {
			return target;
		}
	}else{
		return target;
	}
}

let a = Foo(); // => undefined
let b = new Foo(); // => Foo

export default a === undefined && b.getTarget() == Foo;
