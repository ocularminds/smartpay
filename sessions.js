var ffi = require("@saleae/ffi");
var ref = require("@saleae/ref");
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
var byteArray = ArrayType(ref.types.byte);

var CRT288 = ffi.Library("./libs/CRT_288_K001", {
  GetSysVerion: ["int", ["string"]],
  CRT288KUOpen: ["int", []],
  CRT288KUClose: ["int", ["int"]],
  CRT288KUMultOpen: ["int", [intArray, intPtr]],
  CRT288KUMultClose: ["int", [intArray, "int"]],
  GetDeviceCapabilities: ["int", ["int", intPtr, intPtr]],
  ReadACKReport: ["int", ["int", byteArray, "byte"]],
  ReadReport: ["int", ["int", byteArray, "byte"]],
  WriteReport: ["int", ["int", byteArray, "byte"]],
  USB_ExeCommand: [
    "int",
    [
      "int",
      "byte",
      "byte",
      "int",
      byteArray,
      bytePtr,
      bytePtr,
      bytePtr,
      intPtr,
      byteArray,
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
      byteArray,
      bytePtr,
      bytePtr,
      bytePtr,
      intPtr,
      byteArray,
    ],
  ],
});

const SessionFactory = {
  openUsb: () => {
    var handle = CRT288.CRT288KUOpen();
    return handle;
  },
  openCom: (com, baurdRate) => {
    var handle = CRT.CRT288KROpen(com, baurdRate);
    return handle;
  },
  getDllVersion: () => {
    var version = Buffer.alloc(32);
    CRT288.GetSysVerion(version);
    console.log("DLL Version -> " + version);
    return ref.readCString(version, 0);
  },
  initialize: (wHandle) => {
    CmData = [];
    CmCode = 0x30; // Initialize command
    PmCode = 0x30; // Parameter code
    CmDataLen = 0;
    ReDataLen = ref.alloc("int");
    ReData = new ArrayBuffer(1024);
    ReType = ref.alloc("byte");
    St0 = ref.alloc("byte");
    St1 = ref.alloc("byte");
    var response = CRT288.USB_ExeCommand(
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
  atr: (wHandle) => {
    console.log("\n REQUEST -> Activate CARD CPU");
    CmData = [0x30];
    CmCode = 0x51; // IC Card Control
    PmCode = 0x30; // Parameter code
    CmDataLen = 1;
    ReDataLen = ref.alloc("int");
    ReData = new ArrayBuffer(1024);
    ReType = ref.alloc("byte");
    St0 = ref.alloc("byte");
    St1 = ref.alloc("byte");
    response = crt.USB_ExeCommand(
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
      if (ReDataLen.deref() == 0x30) {
        System.out.println("CPU card is T=0");
      } else {
        System.out.println("CPU card is T=1");
      }

      var sb = "";
      if (ReType.deref() == 0x50) {
        // ATR= start from n= 1
        console.log(new String(ReData));
        for (let n = 1; n < ReDataLen.deref(); n++) {
          try {
            sb.append(String.format("%02x", ReData[n]));
          } catch (ex) {
            console.error(ex);
          }
        }
      }
      if (ReType.deref() == 0x4e && ReDataLen.deref() > 0) {
        //the card is not EMV
        for (let n = 1; n < ReDataLen.deref(); n++) {
          try {
            sb.append(String.format("%02x", ReData[n]));
          } catch (ex) {
            console.error(ex);
          }
        }
      }
      console.log(sb);
      if (ReType.deref() == 0x4e && ReDataLen.deref() == 0) {
        console.log("" + St1.deref() + St0.deref());
      }
    }
    return response;
  },
  getStatus: (wHandle) => {
    console.log("\n REQUEST -> Reset status");
    CmData = [];
    CmCode = 0x31; // Initialize command
    PmCode = 0x30; // Parameter code
    CmDataLen = 0;
    ReDataLen = ref.alloc("int");
    ReData = new ArrayBuffer(1024);
    ReType = ref.alloc("byte");
    St0 = ref.alloc("byte");
    St1 = ref.alloc("byte");
    response = crt.USB_ExeCommand(
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
          Str2 = "One card in the reader, but it is inserted in place";
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
  execute: (wHandle, apdu) => {
    console.log("\nExchanges data between the Host Computer and IC card");
    console.log("Sending apdu command: " + commons.byte2hex(apdu));
    var sb = [];
    var result = [];
    CmCode = 0x51; // IC card control
    PmCode = 0x33; // Deactivate
    CmDataLen = apdu.length; // Data size
    response = crt.USB_ExeCommand(
      wHandle,
      CmCode,
      PmCode,
      CmDataLen,
      apdu,
      ReType,
      St1,
      St0,
      ReDataLen,
      ReData
    );
    console.log(ReType.deref() + " " + ERRORS[ReType.deref()]);
    if (ReType.deref() == 0x50 || ReType.deref() == 0x4e) {
      if (ReType.deref() == 0x50) {
        for (let n = 0; n < ref.deref(ReDataLen); n++) {
          sb.append(util.format("%02x", ReData[n]));
        }

        result[0] = sb.substring(sb.length - 4, sb.length);
        if (sb.length > 4) {
          result[1] = sb.substring(0, sb.length - 4);
        }
      } else {
        //(ReType==0x4e)
        result[0] = "99";
      }
    } else {
      result[0] = "99";
    }
    console.log("Sending apdu response: " + sb.join(""));
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

var version = SessionFactory.getDllVersion();
console.log(version);

var wHandle = SessionFactory.openUsb();
SessionFactory.initialize(wHandle);

module.exports = SessionFactory;
