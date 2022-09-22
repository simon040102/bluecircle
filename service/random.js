const random = () => {
  const upperChars = [];
  const lowerChars = [];

  // A ~ Z 的編碼是 65 ~ 90
  for (let i = 65; i < 91; i++) {
    let char = String.fromCharCode(i);
    upperChars.push(char);
    lowerChars.push(char.toLowerCase());
  }
  const arr = upperChars.concat(lowerChars);
  let randomChar = arr[Math.floor(Math.random() * 52)];
  const nums = [];

  for (let i = 0; i <= 9; i++) {
    nums.push(i);
  }

  // 合併大小寫字母與數字
  const array = upperChars.concat(lowerChars, nums);
  const sixCodes = [];

  for (let i = 1; i <= 6; i++) {
    let randomCode = array[Math.floor(Math.random() * 62)];
    sixCodes.push(randomCode);
  }
  return sixCodes.join('');
};
module.exports = random; 