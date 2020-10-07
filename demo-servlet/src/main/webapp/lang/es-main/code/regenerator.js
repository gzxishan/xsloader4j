function* a() {
  yield 1;
}

let r=a().next();
console.log(r);

export default r.value==1;