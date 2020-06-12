const Printer = require("./printer");
const CardReader = require("./reader");
const PinPad = require("./epp");
const Params = require("./params");
const ResultValues = require("./errors");
const EventEmitter = require("events");
const fs = require("fs");

class Pos extends EventEmitter {
  constructor(file) {
    super();
    this.pin = [];
    const platform = process.platform;
    let cfg = {};
    Object.assign(cfg, {
      COMPUTERNAME: process.env.COMPUTERNAME,
      NUMBER_OF_PROCESSORS: process.env.NUMBER_OF_PROCESSORS,
      OS: process.env.OS,
    });
    console.log("Pos smart pay 2.0");
    console.log("Platform ->", platform);
    console.log("Architecture ->", process.arch);
    console.log("Environment -> ", cfg);
    this.configure(file);
  }

  configure(file) {
    var data = fs.readFileSync(file);
    var config;
    try {
      config = JSON.parse(data);
      this.config = config;
      console.dir(config);
    } catch (err) {
      console.log("There has been an error parsing config.json");
      console.log(err);
    }
  }

  printer() {
    console.log("\nprinter-version event:");
    Printer.getDllVersion().then((version) => {
      console.log("Printer version -> %s", version);
    });
  }

  print(data) {    
    const port = this.config.printer.port;
    const baurd = this.config.printer.baurd;
    console.log("Printer on port",port,"and baurd rate",baurd,":");
    Printer.openPort(port,baurd).then((wHandle) => {
      console.log("printer opened: Handle->" + wHandle);
      Printer.init().then(() => {
        Printer.print(data);
      });
    });
  }

  reader() {
    CardReader.getVersion().then((version) => {
      console.log("Card reader firmware: %s", version);
    });
  }

  card() {
    const interval = setInterval(() => {
      console.log("checking card reader...");
      CardReader.isCardInserted().then((res) => {
        console.log("Card Inserted: " + JSON.stringify(res));
        if (res.response === true) {
          clearInterval(interval);
          CardReader.read(res.handle)
            .then((card) => {
              console.log("EMV Card -> ", card);
              events.emit("connect");
            })
            .catch((err) => console.log("error reading card ", err));
        }
      }, 500);
    });
  }

  pinpad() {
    console.log("\npinpad-version:");
    PinPad.version().then((version) => {
      console.log("PinPad DLL version " + version);
    });
    PinPad.firmware().then((data) => {
      console.log("PinPad firmware " + data);
    });
  }

  pin() {
    console.log("\nconnecting to devices:");
    var response = -1;      
    const port = this.config.pinpad.port;
    const baurd = this.config.pinpad.baurd;
    console.log("PinPad on port",port,"and baurd rate",baurd,":");
    PinPad.openPort(3, 9600)
      .then((res) => {
        response = res;
        if (response != 0) {
          console.log(res + " " + ResultValues[response]);
          return;
        }
      })
      .catch((err) => console.log("cannot open PINPad port ", err));
    PinPad.setAccount(pan).then((response) => console.log(response));
    PinPad.setFunctionKeys(Params.FunctionKey.SEND_NO_CR)
      .then((response) => {
        console.log("setFunctionKeys: " + response);
      })
      .catch((err) => console.log(err));
    PinPad.setKeyboardControl(2).then((control) => {
      console.log("KeyboardControls %s %s", control, ResultValues[control]);
      if (control == 0) {
        PinPad.setFunctionKeys(Params.FunctionKey.DO_SEND_OUT)
          .then((response) => {
            console.log("setFunctionKeys: " + response);
            console.log("Start typing PIN...");
            PinPad.startPin(4, 3, 15);
            PinPad.readCharacters(events).then(() => {
              PinPad.readPinBlock()
                .then((pinblock) => {
                  console.log("pin block ", pinblock);
                })
                .catch((err) => console.log(err));
            });
          })
          .catch((err) => console.log(err));
      }
    });
  }
}

module.exports = Pos;
