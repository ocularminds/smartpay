var ffi = require("@saleae/ffi");
var ref = require("@saleae/ref");
const path = require("path");
var ArrayType = require("@saleae/ref-array");
var bytesPtr = ref.refType(ref.types.uchar);
var KMY350XLibrary = ffi.Library(path.join(__dirname, "libs/KMY350X"), {
  GetDllVer: ["int", ["string"]],
  OpenPort: ["int", ["int", "int"]],
  ClosePort: ["int", ["void"]],
  ScoutKeyPress: ["int", [bytesPtr]],

  LoadMainKey: ["int", ["int", bytesPtr, bytesPtr]],
  LoadWorkKey: ["int", ["int", "int", bytesPtr, bytesPtr]],
  LoadWorkKeySam: [
    "int",
    ["int", "int", "int", bytesPtr, bytesPtr, bytesPtr, bytesPtr, bytesPtr],
  ],
  LoadWorkKeySam: [
    "int",
    ["int", "int", "int", bytesPtr, bytesPtr, bytesPtr, bytesPtr, bytesPtr],
  ],
  DevReset: ["int", ["int"]],
  SetAccount: ["int", [bytesPtr]],
  SetClientSN: ["int", [bytesPtr]],
  ReadClientSN: ["int", [bytesPtr]],
  GetVersion: ["int", ["string"]],
  MACAdd: ["int", [bytesPtr, bytesPtr, "int"]],
  SetMACArithmetic: ["int", ["int"]],
  SetPINRepairMethod: ["int", ["int", "byte"]],
  SetPINArithmetic: ["int", ["int"]],
  SetEncryptMethod: ["int", ["int"]],
  SetMasterMethod: ["int", ["int"]],
  SetEcbCbcMode: ["int", ["int"]],
  SetFunctionKeys: ["int", ["int"]],
  //SetCommunicationMode: ["int", ["int"]],
  ActivateWorkKey: ["int", ["int", "int"]],
  ResponseAsc: ["int", [bytesPtr, bytesPtr]],
  KeyboardControl: ["int", ["int"]],
  SingleKeyControl: ["int", ["byte"]],
  PinStart: ["int", ["int", "int", "int"]],
  ReadPinBlock: ["int", [bytesPtr]],
  DataAdd: ["int", [bytesPtr, bytesPtr]],
  DataUnAdd: ["int", [bytesPtr, bytesPtr]],
  ICReadPinBlock: ["int", [bytesPtr, bytesPtr]],
  ICSendAPDU: ["int", [bytesPtr, bytesPtr]],
  ICPowerOn: ["int", [bytesPtr]],
  ICPowerOff: ["int", ["void"]],
  ICReadType: ["int", ["int", bytesPtr]],
  ICSetType: ["int", ["int", "byte"]],
  RSA_Key_Upload: ["int", [bytesPtr, bytesPtr]],

  RSA_MODULUS_DATA: ["int", [bytesPtr, "byte"]],
  RSA_SECRET_DATA: ["int", [bytesPtr]],
  RSA_PUBLIC_DATA: ["int", [bytesPtr]],
  RSA_ENCRYPT: ["int", [bytesPtr, bytesPtr]],
  RSA_DECRYPT: ["int", [bytesPtr, bytesPtr]],
  DUKPT_LoadDeriveKey: ["int", [bytesPtr]],
  DUKPT_LoadKSN: ["int", [bytesPtr]],
  DUKPT_CTL: ["int", ["byte"]],
  StartMasterKeyInject: ["int", ["int"]],
  StartWorkKeyInject: ["int", ["int", "int"]],
});

module.exports = KMY350XLibrary;
