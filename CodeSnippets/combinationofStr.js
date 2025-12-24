const combinations = (str) => {
    let result=[];
    for(let i=0;i<str.length;i++){
        for(j=i+1;j<str.length+1;j++){
            result.push(str.slice(i,j));
        }
    }
    return result;
}
console.log(combinations("dog"))