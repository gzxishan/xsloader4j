let obj = {
	a: null,
	b: undefined,
	c: false,
	d: 0,
	e: "",
	g: "false"
}

export default (obj.a ?? "A") === "A" && (obj.b ?? "B") === "B" && (obj.c ?? "C") === false && 
				(obj.d ?? "D") === 0 && (obj.e ?? "E") === "" && (obj.f ?? "F") === "false";
