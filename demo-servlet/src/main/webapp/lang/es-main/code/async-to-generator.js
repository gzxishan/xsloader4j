async function bar(){
	return "bar";
}

async function foo() {
 let a = await bar();
 console.log(`foo-${a}`);
}

foo();

export default true;