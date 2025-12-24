function squaresNos() {
  const arr1 = [123456];
  const arr2 = arr1.toString();
  let arr3;
  arr3 = arr2.split("").map(ele => ele * ele).join("");
}
squaresNos(); // fn to square the no. in arr

const highAndLow = numbers => {
  const arr = numbers.split("").map((ele) => Number(ele));
  let maxNo, minNo;
  maxNo = Math.max(...arr);
  minNo = Math.min(...arr);
  return `${maxNo}, ${minNo}`;
};

console.log(highAndLow('9123450'));

const printInDesc = (numbers) => {
  let num1 = numbers.toString();
  const numberArr = num1.split("");
  const sortedArr = numberArr.sort((a, b) => b - a);
  return sortedArr.join("");
};
console.log(printInDesc(102234));
console.log(printInDesc(0));

//type co-ersion
console.log("2" + 2);


//to create a 2d array and flaten it and convert to string
const rows = 3;
const cols = 2;
const newArray = Array.from({ length: rows }, () => new Array(cols).fill(0));
const newStrs = newArray.flat().toString();
console.log("new Strs 1", newStrs);
const result = newStrs.split(",").join("");
console.log("new Str", result);
console.log("newArray", newArray);

//to print the pattern
const pattern = (n) => {
  let num = 1;
  for (let i = 1; i <= n; i++) {
    let row = [];
    for (let j = 0; j < n; j++) {
      row.push(num++);
    }
    if (i % 2 === 0) {
      row.reverse();
    }
    console.log(row.join(""));
  }
}
pattern(4);



function modifyObject(id, name) {
  let emp_data = [
    {
      emp_id: 1,
      emp_name: "Aman",
    },
    {
      emp_id: 2,
      emp_name: "Rashi",
    },
    {
      emp_id: 3,
      emp_name: "Nitya",
    },
  ];
  function res(data, id, name) {
    const res = data?.forEach((element) => {
      if (element.emp_id == id) {
        element.emp_name = name;
      }
    });
    return res;
  }
  res(emp_data, id, name);
  console.log(result);
}
modifyObject(1, "chetanxyz");