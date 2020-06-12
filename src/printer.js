var ffi = require("@saleae/ffi");
var ref = require("@saleae/ref");
uChar = ref.refType("uchar");
const path = require("path");

var Printer = {
  API: ffi.Library(path.join(__dirname, "libs/KMY532.dll"), {
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
  }),
  getDllVersion: async () => {
    var version = Buffer.alloc(128);
    await Printer.API.KMY_PRINT532_GetDllVersion(version);
    console.log("Printer Received version %s", version);
    return version;
  },

  openPort: async (ncom, baudrate) => {
    console.log(`Opening com${ncom} with baurd rate:${baudrate}`);
    var handle = await Printer.API.KMY_PRINT532_OpenPort(ncom, baudrate);
    console.log("open port -> %d", handle);
    return handle;
  },

  closePort: async () => {
    await Printer.API.KMY_PRINT532_ClosePort();
  },

  init: async () => {
    return await Printer.API.KMY_PRINT532_Init();
  },

  print: async (data) => {
    await Printer.API.KMY_PRINT532_PrintData(data);
  },
  cut: async (lineNumber) => {
    await Printer.API.KMY_PRINT532_CutPage(lineNumber);
  },
};

module.exports = Printer;
