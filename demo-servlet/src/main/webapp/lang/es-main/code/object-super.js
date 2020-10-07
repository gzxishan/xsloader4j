class Parent{
	say(){
		return "Hello";
	}
}

class Child extends Parent{
	say () {
	  return super.say() + "World!"
	}
}

let child=new Child();
console.log(child.say());

export default child.say()=="HelloWorld!";