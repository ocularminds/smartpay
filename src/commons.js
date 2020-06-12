var ref = require('@saleae/ref');
var ArrayType = require('@saleae/ref-array');
let Duplex = require('stream').Duplex;
var ByteArray = ArrayType(ref.types.byte);
const commons = {
  HEX: {
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: 'A',
    11: 'B',
    12: 'C',
    13: 'D',
    14: 'E',
    15: 'F',
  },
  bytelen: (data) => {
    var size = Math.floor(data.length / 2);
    var quotient = Math.floor(size / 16);
    var remainder = size % 16;
    return commons.HEX[quotient] + commons.HEX[remainder];
  },

  byte2hex: (byteArray) => {
    return Array.from(byteArray, function (byte) {
      return ('0' + (byte & 0xff).toString(16)).slice(-2);
    })
      .join('')
      .toUpperCase();
  },

  hex2bytes: (data) => {
    var buff = Buffer.from(data, 'hex');
    var bytes = new ByteArray(buff.length);
    for (let x = 0; x < buff.length; x++) {
      bytes[x] = buff[x];
    }
    return bytes;
  },

  hex2binary: (hex) => {
    var result = [];
    for (var n = 0; n < hex.length; n += 2) {
      result.push(parseInt(hex.substr(n, 2), 16).toString(2));
    }
    return result.join('');
  },

  hex2ascii: (hex) => {
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  },

  str2bytes: (str) => {
    var bytes = [];
    var buffer = Buffer.alloc(str.length * 2);
    for (var i = 0; i < buffer.length; i++) {
      bytes.push(buffer[i]);
    }
  },
  trim: (str) => {
    return str.replace(/\s/g, '');
  },
  buffer2stream(buffer) {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
  },
  stream2buffer(stream) {
    return new Promise((resolve, reject) => {
      let buffers = [];
      stream.on('error', reject);
      stream.on('data', (data) => buffers.push(data));
      stream.on('end', () => resolve(Buffer.concat(buffers)));
    });
  },
};

module.exports = commons;

console.log('AIP CVR check -> ',commons.hex2binary("5800"));
