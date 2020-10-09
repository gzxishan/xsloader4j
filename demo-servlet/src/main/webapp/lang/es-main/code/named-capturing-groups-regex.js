let re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
let rs = re.exec("1999-02-29");
console.log("rs:");
console.log(rs);
console.log(rs.groups.year);

export default rs.groups.year == "1999";
