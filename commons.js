const commons = {
  HEX: {
    0: "0",
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "A",
    11: "B",
    12: "C",
    13: "D",
    14: "E",
    15: "F",
  },
  bytelen: (length) => {
    var size = data.length / 2;
    var s = Integer.toString(size);
    var quotient = size / 16;
    var remainder = size % 16;
    return Hex[quotient] + HEX[remainder];
  },
  factorial: (number) => {
    let f = 1;
    while (number > 1) {
      f = f * number;
      number -= 1;
    }
    return f;
  },

  byte2hex: (byteArray) => {
    return Array.from(byteArray, function (byte) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    }).join("");
  },

  hex2ascii: (hex) => {
    var str = "";
    for (var n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  },

  str2bytes: (str) => {
    var bytes = [];
    var buffer = Buffer.alloc(str, "utfi6");
    for (var i = 0; i < buffer.length; i++) {
      bytes.push(buffer[i]);
    }
  },
};

module.exports = commons;
