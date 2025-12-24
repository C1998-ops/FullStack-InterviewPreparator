const newArr = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const uniqueArr = [...new Set(newArr)];
const removeDuplicates = (arr) => {
    let val;
    for (let i = 0; i < arr.length - 1; i++) {
        val = arr[i];
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) {
                arr.splice(j, 1);
                j--;
            }
        }
    }
    return arr;
}
console.time("timer started");
console.log(removeDuplicates(newArr)); // 9
console.timeEnd("timer ended");