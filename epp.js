var ref = require("@saleae/ref");
const commons = require("./commons");
const KMY350XLibrary = require("./kmy350X");
const ResultValues = require("./errors");

const PinPad = {
  openPort: () => {
    var Port = 1;//parseInt(props.getProperty(SERIAL_PORT));
    var BaudRate = 34800;//parseInt(props.getProperty(BAURD_RATE));
    var response = KMY350XLibrary.OpenPort(Port, BaudRate);
    return response;
  },

  closePort: () => {
    return KMY350XLibrary.ClosePort();
  },

  factoryReset: () => {
    return KMY350XLibrary.DevReset(2);
  },

  firmware: () => {
    var UcClientSN = Buffer.alloc(256);
    var response = KMY350XLibrary.ReadClientSN(UcClientSN);
    if (response == 0) {
      return ref.readCString(UcClientSN, 0);
    }
    return ResultValues[response];
  },

  version: () => {
    var UcVersion = Buffer.alloc(16);
    var response = KMY350XLibrary.GetDllVer(UcVersion);
    if (response == 0) {
      return ref.readCString(UcVersion, 0);
    }
    return ResultValues[response];
  },

  setKeyboardControl(type) {
    var response = KMY350XLibrary.KeyboardControl(type);
    return response;
  },

  setFunctionKeys(type) {
    var response = KMY350XLibrary.SetFunctionKeys(type);
    return response;
  },

  readOneCharacter: async () => {
    var input;
    while ((input = readKeyboard()).isEmpty()) {
      try {
        Thread.sleep(60);
      } catch (ex) {
        console.error(ex);
      }
    }
    return KeyTable.key(input);
  },

  readCharacters: async () => {
    var sb = [];
    var input;
    while (sb.length <= 256) {
      input = readKeyboard();
      if (!input.isEmpty()) {
        console.log(input);
        if (input.equalsIgnoreCase("0D")) {
          return sb.join("");
        } else {
          sb.append(KeyTable.key(input));
        }
      }
      try {
        Thread.sleep(30);
      } catch (ex) {
        console.error(ex);
      }
    }
    return sb.join("");
  },

  SingleKeyControl: (CStr) => {
    var response = KMY350XLibrary.SingleKeyControl(CStr);
    return response;
  },

  /**
   * Monitor the EPP ?Monitor the EPP response value, if "1" is pressed, 0x31
   * returned. The press on confirm key will generate the "0x0D"?
   *
   * Need create a new thread to monitor the press key. more than 60ms gap
   * between each time. [Output Parameter]?UcChar Recevie Key press char. If
   * key is pressed , Return 2 byte data, and need change them to 1 byte of
   * ASCII code. If have no press, return 0x00. [Example]	If press 1, it will
   * return 0x33 0x31, and change them to ascii is 0x31. If press Enter, it
   * will return 0x30 0x44, and change them to ascii is 0x0d. [Return Value]
   * ?function return status INT, return 0 is successful, or is failed.
   *
   * @return
   */
  readKeyboard: () => {
    var keypressed = Buffer.alloc(2);
    var response = KMY350XLibrary.ScoutKeyPress(keypressed);
    if (response == 0) {
      var o = Strings.byte2hex(keypressed.getBytes());
      var a = o == "0000" ? "" : commons.hex2ascii(o);
      if (o != "0000") {
        console.log("hex -> " + o + " ascii -> " + a);
      }
      return a;
    }
    return "";
  },

  importZoneMasterKey(KeyId, kmc, kcv) {
    var result = [];
    var UcKey = Buffer.alloc(256);
    UcKey.setBytes(kmc.getBytes());
    var UcAuthCode = Buffer.alloc(8);
    var response = KMY350XLibrary.LoadMainKey(KeyId, UcKey, UcAuthCode);
    result[0] = Integer.toString(response);
    if (response == 0) {
      kcv = new String(UcAuthCode.getBytes());
      result[1] = kcv;
    }
    return result;
  },

  /**
   * Import working key
   *
   * workingkeys cryptograph(WP) is an 8/16/24 data. Using the Masterkey M and
   * ECB mode to decrypt the data to obtain the workingkeys(WK), and reserve
   * it to the appointed workingkey number N(0003h) memory.
   *
   * In this command, the workingkey number N is in the range of 40h~7Fh, the
   * workingkey will be reserved to the correspond workingkey number N
   * (00h~3Fh) memory, and return the message by verification. The encryption
   * status will be closed after message returned.
   *
   * @param mainKeyId
   * @param workKeyId
   * @param key
   * @param kcv
   * @return
   */
  importWorkingKey: (mainKeyId, workKeyId, key, kcv) => {
    var UcKey = new Buffer(16);
    UcKey.setBytes(Strings.hex2byte(key));
    var UcAuthCode = Buffer.alloc(16);
    var response = KMY350XLibrary.LoadWorkKey(
      mainKeyId,
      workKeyId,
      UcKey,
      UcAuthCode
    );
    var result = ["-1", "OK"];
    result[0] = Integer.toString(response);
    if (response == 0) {
      kcv = new String(UcAuthCode.getBytes());
      result[1] = kcv;
    }
    return result;
  },

  activateWorkKey: (masterKeyId, workKeyId) => {
    return KMY350XLibrary.ActivateWorkKey(masterKeyId, workKeyId);
  },

  reset(type) {
    var response = KMY350XLibrary.DevReset(type);
    return response;
  },

  setAccount: (cardNumber) => {
    var UcAccount = new Buffer(cardNumber, "uint16le");
    var response = KMY350XLibrary.SetAccount(UcAccount);
    return response;
  },

  setClientSN(clientSN) {
    var UcClientSN = Buffer.alloc(256);
    UcClientSN.setBytes(clientSN.getBytes());
    var response = KMY350XLibrary.SetClientSN(UcClientSN);
    return response;
  },

  addMac(mac, type) {
    var UcMacStr = Buffer.alloc(256);
    UcMacStr.setBytes(mac.getBytes());
    var UcMacStrResult = Buffer.alloc(256);
    var response = KMY350XLibrary.MACAdd(UcMacStr, UcMacStrResult, type);
    return response;
  },

  startPin(PinLen, AddMode, TimeOut) {
    var response = KMY350XLibrary.PinStart(PinLen, AddMode, TimeOut);
    return response;
  },

  /**
   * Get the secrete text (pinblock) from EPP?read the ciphertext after PIN
   * algorithm?
   *
   * @return
   */
  readPinBlock: () => {
    var UcPinBloc = Buffer.alloc(16);
    var response = KMY350XLibrary.ReadPinBlock(UcPinBloc);
    console.log(response);
    if (response == 0) {
      var pinblock = ref.readCString(UcPinBloc, 0);
      return pinblock;
    }
    return "";
  },

  encrypt: (UcData, UcReData) => {
    var response = KMY350XLibrary.DataAdd(UcData, UcReData);
    return response;
  },

  decrypt: (UcData, UcReData) => {
    var response = KMY350XLibrary.DataUnAdd(UcData, UcReData);
    return response;
  },

  iCReadPinBlock: (UcData, UcReData) => {
    var response = KMY350XLibrary.ICReadPinBlock(UcData, UcReData);
    return response;
  },

  iCSendAPDU: (UcData, UcReData) => {
    var response = KMY350XLibrary.ICSendAPDU(UcData, UcReData);
    return response;
  },

  iCPowerOn: (UcReData) => {
    var response = KMY350XLibrary.ICPowerOn(UcReData);
    return response;
  },

  iCPowerOff: () => {
    var response = KMY350XLibrary.ICPowerOff();
    return response;
  },

  iCReadType: (ISeat, UcType) => {
    var response = KMY350XLibrary.ICReadType(ISeat, UcType);
    return response;
  },

  iCSetType: (ISeat, UcType) => {
    var response = KMY350XLibrary.ICSetType(ISeat, UcType);
    return response;
  },
};

module.exports = PinPad