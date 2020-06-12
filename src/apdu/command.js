const TemplateParser = require('../emv/TemplateParser');
const commons = require('../commons');
class CommandApdu {
  //extends Emitter {
    buildPdol(pdol) {
    var val;
    if (pdol === '') {
      return '80 A8 00 00 02 83 00 00';
    }
    const tags = TemplateParser.parseTags(pdol);
    console.log('Pdol', pdol);
    console.log('Tags', tags);
    var sb = [];
    if (tags['9F35']) {
      sb.push('22');
    }
    if (tags['9F40']) {
      sb.push('0000000000');
    }
    if (tags['9F33']) {
      sb.push('E0F8C8');
    }
    sb.splice(0, 0, commons.bytelen(sb.join('')));
    sb.splice(0, 0, '83');
    sb.splice(0, 0, commons.bytelen(sb.join('')));
    sb.splice(0, 0, '80 A8 00 00');
    const apdu = sb.join(' ') + '00';
    return commons.hex2bytes(commons.trim(apdu));
  }
}

module.exports = CommandApdu;
