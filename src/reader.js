const SessionFactory = require('./sessions');
const AIDS = require('./aids');
const commons = require('./commons');
const Application = require('./emv/Application');
const Card = require('./emv/Card');
const TemplateParser = require('./emv/TemplateParser');
const CardVerification = require('./emv/CardVerification');
const CommandApdu = require('./apdu/command');
const ResponseApdu = require('./apdu/response');

var CmData;
var CmCode;
var PmCode;
var CmDataLen;
var ReDataLen;
var ReType;
var St0;
var St1;
var ReData;

const CardReader = {
  getVersion: async () => {
    var version = await SessionFactory.getDllVersion();
    return version;
  },

  isCardInserted: async () => {
    var wHandle = await SessionFactory.openUsb();
    if (wHandle <= 0) {
      console.log('Card reader not initialized.');
      await SessionFactory.close();
      return {response: false};
    }
    console.log('Open USB port. Handle -> ' + wHandle);
    var response = await SessionFactory.initialize(wHandle);
    console.log('Initialize -> ' + wHandle);

    if (response != 0) {
      await SessionFactory.close();
      return {response: false};
    }
    const atr = await SessionFactory.atr(wHandle);
    if (atr.response != 0) {
      await SessionFactory.close();
      return {response: false};
    }
    console.log('ATR response -> ', atr);
    return {response: true, handle: wHandle, protocol: atr.protocol};
  },
  read: async (wHandle, protocol) => {
    console.log('Reading card...Handle:' + wHandle);
    var result = [];
    for (let index = 0; index < AIDS.length; index++) {
      const AID = AIDS[index];
      var command = '00 A4 04 00 ' + commons.bytelen(AID) + AID + '00';
      var apdu = commons.hex2bytes(commons.trim(command));
      result = await SessionFactory.execute(wHandle, protocol, apdu);
      console.log('command result', result);
      if (result[0].toUpperCase() === '9000') {
        console.log('Card application found. AID ' + AID);
        console.log('CODE: ' + result[0]);
        console.log('DATA: ' + result[1]);
        console.log(' Read AFL Data');
        var app = new Application();
        await TemplateParser.parse(result[1], app);
        console.log(' Read AFL Data');
        await CardReader.readFci(wHandle, protocol, app);
        var card = new Card(app);
        console.log('\nRead SFI Data for card: ', card);
        await CardReader.readSfi(wHandle, protocol, card);
        if (card.cvmlist) {
          console.log('\n CVM-LIST: ', card.cvmlist);
          card = new CardVerification(card);
          card.verify();
        }
        return card;
      }
    }
    return null;
  },
  readFci: async (wHandle, protocol, app) => {
    const command = new CommandApdu();
    const apdu = command.buildPdol(app.pdol);
    const result = await SessionFactory.execute(wHandle, protocol, apdu);
    if (result[0] === '9000') {
      await TemplateParser.parseFci(result[1], app);
    }
  },
  readSfi: async (wHandle, protocol, card) => {
    for (
      let j = 0;
      j < card.app.files.length && card.app.files[j] != null;
      ++j
    ) {
      const AFLGroup = commons.hex2bytes(card.app.files[j]);
      const startRecordNumber = AFLGroup[1] & 255;
      const sfiNumber = AFLGroup[0] >> 3;
      const endRecordNumber = AFLGroup[2] & 255;
      const numRecordsInvolvedInOfflineDataAuthentication = AFLGroup[3] & 255;
      for (var x = startRecordNumber; x <= endRecordNumber; ++x) {
        await CardReader.readRecord(wHandle, protocol, x, sfiNumber, card);
      }
    }
  },
  readRecord: async (wHandle, protocol, recordNum, SFI, card) => {
    console.log(`SFI ${SFI} record: ${recordNum}`);
    const P1 = recordNum;
    const P2 = (SFI << 3) | 4;
    var apdu = [0, -78, P1, P2, 0, 0];
    const result = await SessionFactory.execute(wHandle, protocol, apdu);
    if (result[0] === '9000') {
      await TemplateParser.parseSfi(result[1], card);
    }
  },
};

module.exports = CardReader;
