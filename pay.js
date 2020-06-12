process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", reason.stack || reason);
});
const path = require("path");
const Pos = require("./src/Pos");
const pos = new Pos(path.join(__dirname, "config.json"));
const data =
  "This is allW e can Print\n This is allW e can Print\n" +
  "This is all we can Print\nThis is allW e can Print\n" +
  "For your purchase\nTotal: N300.00";

pos.printer();
pos.reader();
pos.pinpad();

//scans for card input. On card found attempts to read card details
//and logs it. Then proceed to ask for pin
pos.on("card-ready", () => {
  pos.pin();
});

//manage how you display pin type
pos.on("pin_key_pressed", (data) => {
  pos.pin.push(data);
  console.log("pin_key_pressed: ", pin.join(""));
  if (pos.pin.length === 4) {
    PinPad.readPinBlock()
      .then((pinblock) => {
        console.log("pin block received ->", pinblock);
      })
      .catch((err) => console.log(err));
  }
});
pos.card();
