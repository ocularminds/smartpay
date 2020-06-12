var ffi = require("@saleae/ffi");
var ref = require("@saleae/ref");
const path = require("path");
var ArrayType = require("@saleae/ref-array");
var commons = require("./commons");

const ERRORS = {
  0x50: "Success",
  0x4e: "Fail",
  0x10: "Cancel by Lower Machine (NAK )",
  0x20: "Communication Error",
  0x30: "Cancel by HOST machine (EOT)",
};

var intPtr = ref.refType("int");
var bytePtr = ref.refType("byte");
var intArray = ArrayType(ref.types.int);
var ByteArray = ArrayType(ref.types.byte);

var CRT288 = ffi.Library(path.join(__dirname, "libs/CRT_288_K001.dll"), {
  GetSysVerion: ["int", ["string"]],
  CRT288KUOpen: ["int", []],
  CRT288KUClose: ["int", ["int"]],
  CRT288KUMultOpen: ["int", [intArray, intPtr]],
  CRT288KUMultClose: ["int", [intArray, "int"]],
  GetDeviceCapabilities: ["int", ["int", intPtr, intPtr]],
  ReadACKReport: ["int", ["int", ByteArray, "byte"]],
  ReadReport: ["int", ["int", ByteArray, "byte"]],
  WriteReport: ["int", ["int", ByteArray, "byte"]],
  USB_ExeCommand: [
    "int",
    [
      "int",
      "byte",
      "byte",
      "int",
      ByteArray,
      bytePtr,
      bytePtr,
      bytePtr,
      intPtr,
      ByteArray,
    ],
  ],
  CRT288KROpen: ["int", ["string"]],
  CRT288KROpenWithBaut: ["int", ["string", "int"]],
  CRT288KRClose: ["int", ["int"]],
  RS232_ExeCommand: [
    "int",
    [
      "int",
      "byte",
      "byte",
      "int",
      ByteArray,
      bytePtr,
      bytePtr,
      bytePtr,
      intPtr,
      ByteArray,
    ],
  ],
});

const SessionFactory = {
  openUsb: async () => {
    var handle = await CRT288.CRT288KUOpen();
    return handle;
  },
  openCom: async (com, baurdRate) => {
    var handle = await CRT.CRT288KROpen(com, baurdRate);
    return handle;
  },
  getDllVersion: async () => {
    var version = Buffer.alloc(32);
    await CRT288.GetSysVerion(version);
    console.log("DLL Version -> " + version);
    return ref.readCString(version, 0);
  },
  initialize: async (wHandle) => {
    CmData = [];
    CmCode = 0x30; // Initialize command
    PmCode = 0x31; // Parameter code(keep lockup)
    CmDataLen = 0;
    ReDataLen = ref.alloc("int");
    ReData = ref.alloc(ByteArray);
    ReType = ref.alloc("byte");
    St0 = ref.alloc("byte");
    St1 = ref.alloc("byte");
    var response = await CRT288.USB_ExeCommand(
      wHandle,
      CmCode,
      PmCode,
      CmDataLen,
      CmData,
      ReType,
      St1,
      St0,
      ReDataLen,
      ReData
    );
    console.log("USB_ExeCommand - response: " + response);
    console.log("type: ", ReType, " status ", St1, St0, " data ", ReData);
    console.log("" + St1.deref() + St0.deref());
    console.log(ReType.deref() + " " + ERRORS[ReType.deref()]);
    if (ReType.deref() == 0x50 || ReType.deref() == 0x4e) {
      if (ReType.deref() == 0x50) {
        console.log("Received positive reply ");
        if (ReType.deref() > 0) {
          console.log("ReData - " + ReData);
        }
      }
    }
    return response;
  },
  /**
   * CPU Card Reset (Initialization)
   */
  atr: async (wHandle) => {
    console.log("\n REQUEST -> Activate CARD CPU");
    CmData = [0x30];
    CmCode = 0x51; // IC Card Control
    PmCode = 0x30; // Parameter code
    CmDataLen = 1;
    ReDataLen = ref.alloc("int");
    ReData = Buffer.alloc(64);
    ReData.type = ref.types.byte;
    ReType = ref.alloc("byte");
    St0 = ref.alloc("byte");
    St1 = ref.alloc("byte");
    response = await CRT288.USB_ExeCommand(
      wHandle,
      CmCode,
      PmCode,
      CmDataLen,
      CmData,
      ReType,
      St1,
      St0,
      ReDataLen,
      ReData
    );
    console.log(ReType.deref() + " " + ERRORS[ReType.deref()]);
    if (response == 0) {
      if (ReDataLen.deref() === 0x30) {
        console.log("CPU card is T=0");
      } else {
        console.log("CPU card is T=1");
      }

      var sb = new ByteArray(ReDataLen.deref());
      console.log("ATR: ", ReData.toString("hex"));
      console.log("" + St1.deref() + St0.deref());
      console.log(ReData.deref());

      if (ReType.deref() == 0x50) {
        // ATR= start from n= 1
        const len = ReDataLen.deref();
        const data = ReData.toString("hex", 1, len);
        console.log("EMV Card: ", data);
      }
      if (ReType.deref() == 0x4e && ReDataLen.deref() > 0) {
        //the card is not EMV
        const len = ReDataLen.deref();
        const data = ReData.toString("hex", 0, len);
        console.log("None EMV Card: ", data);
      }
      if (ReType.deref() == 0x4e && ReDataLen.deref() == 0) {
        console.log("SW" + St1.deref() + St0.deref());
      }
    }
    const protocol = ReDataLen.deref() === 0x30 ? "T0" : "T1";
    return { response, protocol };
  },
  /**
   * Obtain status code ST0, ST1
   */
  getStatus: async (wHandle, protocol) => {
    console.log("\n REQUEST -> Reset status");
    CmData = [];
    CmCode = 0x51; // Initialize command
    PmCode = 0x32; // Parameter code
    CmDataLen = 0;
    ReDataLen = ref.alloc("int");
    ReData = Buffer.alloc(512);
    ReData.type = ref.types.byte;
    ReType = ref.alloc("byte");
    St0 = ref.alloc("byte");
    St1 = ref.alloc("byte");
    response = await CRT288.USB_ExeCommand(
      wHandle,
      CmCode,
      PmCode,
      CmDataLen,
      CmData,
      ReType,
      St1,
      St0,
      ReDataLen,
      ReData
    );
    console.log(ReType.deref() + " " + ERRORS[ReType.deref()]);
    if (response == 0) {
      var Str1 = "",
        Str2 = "";
      switch (St1.deref()) {
        case 48:
          Str1 = "Hook lock has been activated";
          break;
        case 49:
          Str1 = "Hook lock has been released";
          break;
      }
      switch (ref.deref(St0)) {
        case 48:
          Str2 = "No card in the ICRW";
          break;
        case 49:
          Str2 = "One card in the ICRW, but it is not inserted in place";
          break;
        case 50:
          Str2 = "One card in the reader, and it is inserted in place";
      }
      console.log(
        "Card Status OK\r\n" +
          Str1 +
          "\r\n" +
          Str2 +
          "\r\nCard Status: " +
          St1.deref() +
          ref.deref(St0)
      );
    }
    return response;
  },
  /**
   * CPU Card operation - CmCode 51
   * 33H T=0 CPU Card APDU operation
   * 34H T=1 CPU Card APDU operation
   */
  execute: async (wHandle, protocol, apdu) => {
    console.log("\nExchanges data between the Host Computer and IC card");
    console.log("APDU request: " + commons.byte2hex(apdu));
    var result = [];
    CmCode = 0x51; // IC card control
    PmCode = protocol === "T0" ? 0x33 : 0x34;
    PmCode = 0x33;
    ReData = Buffer.alloc(512);
    ReDataLen = ref.alloc("int");
    ReData.type = ref.types.byte;
    CmDataLen = apdu.length; // Data size
    CmData = Buffer.from(apdu);
    CmData.type = ref.types.byte;
    response = await CRT288.USB_ExeCommand(
      wHandle,
      CmCode,
      PmCode,
      CmDataLen,
      CmData,
      ReType,
      St1,
      St0,
      ReDataLen,
      ReData
    );
    console.log("USB_ExeCommand - response: " + response);
    if (ReType.deref() == 0x50 || ReType.deref() == 0x4e) {
      if (ReType.deref() == 0x50) {
        const len = ReDataLen.deref();
        const res = ReData.toString("hex", 0, len);
        console.log("APDU response: " + res);

        result[0] = res.substring(res.length - 4, res.length);
        result[1] = res.substring(0, res.length - 4);
        if (result[0].substring(0, 2) === "6C") {
          const le = result[0].substring(2, 4);
          apdu = [0, -78, P1, P2, commons.hex2bytes(le)[0], 0];
          result = SessionFactory.execute(wHandle, protocol, apdu);
        }
      } else {
        //(ReType==0x4e)
        result[0] = "99";
      }
    } else {
      result[0] = "99";
    }
    return result;
  },
};

var CmData;
var CmCode;
var PmCode;
var CmDataLen;
var ReDataLen;
var ReType;
var St0;
var St1;
var ReData;

module.exports = SessionFactory;
