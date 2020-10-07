//Simple class decorator
@annotation
class MyClass1 {}

function annotation(target) {
	target.annotated = true;
}

//Class decorator
@isTestable(true)
class MyClass2 {}

function isTestable(value) {
	return function decorator(target) {
		target.isTestable = value;
	}
}

//Class function decorator
class C {
	@enumerable(false)
	method() {}
}

function enumerable(value) {
	return function(target, key, descriptor) {
		descriptor.enumerable = value;
		return descriptor;
	}
}

export default true;
