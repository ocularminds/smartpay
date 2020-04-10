const Printer = require("./natives");
const SessionFactory = require("./sessions");
const AIDS = require("./aids");

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
  getVersion: () => {
    var version = SessionFactory.getDllVersion();
    return version;
  },

  isCardInserted: () => {
    //SessionFactory.open();
    var whandle = SessionFactory.openUsb();
    if (handle <= 0) {
      console.log("Card reader not initialized.");
      SessionFactory.close();
      return false;
    }
    console.log("Open USB port. Handle -> " + handle);
    var response = SessionFactory.initialize(wHandle);
    if (response != 0) {
      SessionFactory.close();
      return false;
    }
    response = SessionFactory.atr(wHandle);
    if (response != 0) {
      SessionFactory.close();
      return false;
    }
    console.log("ATR response -> " + response);
    return true;
  },
  read: () => {
    console.log("Test CRT288K001 Smart Card Reader");
    var wHandle = SessionFactory.open();
    if (wHandle <= 0) {
      console.log("Card reader not initialized." + wHandle);
      return;
    }

    console.log("Open USB port. Handle -> " + wHandle);
    response = session.initialize();
    if (response != 0) {
      return;
    }

    response = SessionFactory.atr(wHandle);
    System.out.println("ATR response: " + response);
    var result = [];
    foreach(AIDS, (AID, index) => {
      var apdu = commons.hex2byte(
        Strings.removeSpaces("00 A4 04 00 " + commons.bytelen(AID) + AID + "00")
      );
      result = SessionFactory.execute(wHandle, apdu);
      if (result[0] == "9000") {
        console.log("Card application found. AID " + AID);
        console.log("CODE: " + result[0]);
        console.log("DATA: " + result[1]);
        session.close();
        return result;
      }
    });
  },
};

module.exports = CardReader;
