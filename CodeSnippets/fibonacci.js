const fibonacci1 =(n) => {
let first = 0,second = 1;
let third;
const arr= []
arr.push(first,second);
for(let i=2;i<n;i++){
    third = first + second;
    first = second;
    second = third;
    arr.push(third);
}
return arr;
}
function fibonacciArr(n){
    const arr = [0,1];
    for(let i=2;i<n;i++){
        arr[i] = arr[i-1] + arr[i-2];
    }
    return arr;

}
console.log(fibonacciArr(3))
console.log(fibonacci1(3));