var ffi = require("@saleae/ffi");
var ref = require("@saleae/ref");
uChar = ref.refType("uchar");

var print532 = ffi.Library("KMY532", {
  KMY_PRINT532_OpenPort: ["int", ["int", "int"]],
  KMY_PRINT532_ClosePort: ["int", []],
  KMY_PRINT532_Init: ["int", []],
  KMY_PRINT532_GetStatus: ["int", [uChar]],
  KMY_PRINT532_GotoBlackMark: ["int", []],
  KMY_PRINT532_SetLeftSpace: ["int", ["int", "int"]],
  KMY_PRINT532_BackStartPosition: ["int", ["int"]],
  KMY_PRINT532_SetBarcodeHeightAndWidth: ["int", ["int", "int"]],
  KMY_PRINT532_CutPage: ["int", ["int"]],
  KMY_PRINT532_SetCharacterSpacing: ["int", ["int", "int", "int"]],
  KMY_PRINT532_SetFontMode: ["int", ["int"]],
  KMY_PRINT532_SetFontStye: ["int", ["int", "int", "int"]],
  KMY_PRINT532_SetHRIPrintPostion: ["int", ["int"]],
  KMY_PRINT532_SetHRIFontSize: ["int", ["int"]],
  KMY_PRINT532_SetPrintArea: ["int", ["int", "int"]],
  KMY_PRINT532_FreePage: ["int", ["int"]],
  KMY_PRINT532_PrintData: ["int", ["string"]],
  KMY_PRINT532_PrintFile: ["int", ["string"]],
  KMY_PRINT532_PrintBarCode: ["int", ["string"]],
  KMY_PRINT532_SetPrintArrangement: ["int", ["int"]],
  KMY_PRINT532_PrintNVBMP: ["int", ["string", "int"]],
  KMY_PRINT532_GetDllVersion: ["int", ["string"]],
});

var Printer = {
  getDllVersion: () => {
    var version = Buffer.alloc(32);
    print532.KMY_PRINT532_GetDllVersion(version);
    console.log("DLL Version -> " + version);
    return version;
  },

  openPort: (ncom, baudrate) => {
    console.log("Opening com%d with baurd rate:%d");
    var handle = print532.KMY_PRINT532_OpenPort(ncom, baudrate);
    console.log("open port -> %d", handle);
    return handle;
  },

  closePort: () => {
    print532.KMY_PRINT532_ClosePort();
  },

  init: () => {
    return print532.KMY_PRINT532_init();
  },

  print: (data) => {
    print532.KMY_PRINT532_PrintData(data)
  },
  cut: (lineNumber)=>{
      print532.KMY_PRINT532_CutPage(lineNumber)
  }
};

module.exports = Printer;
