let a="a";
let obj = {
	["x" + a]: "heh",
	["y" + a]: "noo",
	foo: "foo",
	bar: "bar"
};

export default "xa" in obj && "ya" in obj;
