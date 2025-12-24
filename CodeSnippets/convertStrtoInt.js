function convertStrtoInt(){
let str = "123";
let b =+str;
let str1 = "123.05";
let b1 = Math.round(+str1);
console.log(b); // 123
console.log(typeof b); // number
}
convertStrtoInt.apply(null, []);