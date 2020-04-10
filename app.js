const Printer = require("./src/printer");
const CardReader = require("./src/reader");
const PinPad = require("./src/epp");
const ResultValues = require("./src/errors");

const main = () => {
  var version = Printer.getDllVersion();
  console.log("Printer version -> " + version);

  var version = CardReader.getVersion();
  console.log("Card reader firmware: " + version);

  var pan = "987123456789";
  console.log("PinPad DLL version " + PinPad.version());
  console.log("PinPad firmware " + PinPad.firmware());
  var response = PinPad.openPort();
  if (response != 0) {
    console.log(ResultValues[response]);
    return;
  }
  pinpad.setAccount(pan);
  pinpad.setFunctionKeys(Params.FunctionKey.SEND_NO_CR);
  var control = pinpad.setKeyboardControl(2);
  console.log("KeyboardControls %s %s", control, ResultValues[control]);
  if (control == 0) {
    pinpad.setFunctionKeys(Params.FunctionKey.DO_SEND_OUT);
    console.log("Start typing PIN..");
    pinpad.startPin(4, 3, 15);
    pinpad.readCharacters();
    var pinblock = pinpad.readPinBlock();
    console.log(pinblock);
  }
};

module.exports = main;
