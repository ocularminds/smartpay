var ref = require('@saleae/ref');
const commons = require('./commons');
const KMY350XLibrary = require('./kmy350X');
const ResultValues = require('./errors');
const KeyTable = require('./keys');

const PinPad = {
  openPort: async (Port, BaudRate) => {
    var response = await KMY350XLibrary.OpenPort(Port, BaudRate);
    return response;
  },

  closePort: async () => {
    return await KMY350XLibrary.ClosePort();
  },

  factoryReset: async () => {
    return await KMY350XLibrary.DevReset(2);
  },

  firmware: async () => {
    var UcClientSN = Buffer.alloc(256);
    var response = await KMY350XLibrary.ReadClientSN(UcClientSN);
    if (response == 0) {
      return ref.readCString(UcClientSN, 0);
    }
    return ResultValues[response];
  },

  version: async () => {
    var UcVersion = Buffer.alloc(16);
    var response = await KMY350XLibrary.GetDllVer(UcVersion);
    if (response == 0) {
      return ref.readCString(UcVersion, 0);
    }
    return ResultValues[response];
  },

  setKeyboardControl: async (type) => {
    var response = await KMY350XLibrary.KeyboardControl(type);
    return response;
  },

  setFunctionKeys: async (type) => {
    var response = await KMY350XLibrary.SetFunctionKeys(type);
    return response;
  },

  readOneCharacter: async () => {
    let input = '';
    while (input.trim() === '') {
      input = await PinPad.readKeyboard();
      if (input.trim()) {
        return KeyTable.key(input.trim());
      }
    }
    return input;
  },

  readCharacters: async (events) => {
    var sb = [];
    const monitor = setInterval(() => {
      PinPad.readKeyboard().then((response) => {
        if (response) {
          if (response === '0D') {
            clearInterval(monitor);
            PinPad.readPinBlock()
              .then((pinblock) => {
                console.log('pin block ', pinblock);
              })
            return sb.join('');
          } else {
            events.emit('pin_key_pressed', KeyTable[response]);
            sb.push(KeyTable[response]);
          }
        }
      });
      if (sb.length > 256) clearInterval(monitor);
    }, 60);
    return sb.join('');
  },

  SingleKeyControl: async (CStr) => {
    var response = await KMY350XLibrary.SingleKeyControl(CStr);
    return response;
  },

  /**
   * Monitor the EPP response value, if "1" is pressed, 0x31
   * returned. The press on confirm key will generate the "0x0D"?
   *
   * Need create a new thread to monitor the press key. more than 60ms gap
   * between each time. [Output Parameter]?UcChar Receive Key press char. If
   * key is pressed , Return 2 byte data, and need change them to 1 byte of
   * ASCII code. If have no press, return 0x00. [Example]	If press 1, it will
   * return 0x33 0x31, and change them to ascii is 0x31. If press Enter, it
   * will return 0x30 0x44, and change them to ascii is 0x0d. [Return Value]
   * ?function return status INT, return 0 is successful, or is failed.
   *
   * @return
   */
  readKeyboard: async () => {
    var keypressed = Buffer.alloc(2);
    keypressed.type = ref.types.byte;
    var response = await KMY350XLibrary.ScoutKeyPress(keypressed);
    //console.log('keypressed ' + response, '\n', keypressed);
    //console.log('Hex value: ' + keypressed.toString('hex'));
    if (response === 0) {
      var o = keypressed.toString('hex');
      //console.log('asci -> ', Buffer.from(o, 'hex').toString());
      var a = o == '0000' ? '' : Buffer.from(o, 'hex').toString();
      if (o != '0000') {
        //console.log('hex -> ' + o + ' ascii -> ' + a);
      }
      return a;
    }
    return '';
  },

  importZoneMasterKey: async (KeyId, kmc, kcv) => {
    var result = [];
    var UcKey = Buffer.alloc(256);
    UcKey.type = ref.types.byte;
    UcKey.setBytes(kmc.getBytes());
    var UcAuthCode = Buffer.alloc(8);
    var response = await KMY350XLibrary.LoadMainKey(KeyId, UcKey, UcAuthCode);
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
  importWorkingKey: async (mainKeyId, workKeyId, key, kcv) => {
    var UcKey = Buffer.alloc(16);
    UcKey.type = ref.types.byte;
    UcKey.setBytes(Strings.hex2byte(key));
    var UcAuthCode = Buffer.alloc(16);
    var response = await KMY350XLibrary.LoadWorkKey(
      mainKeyId,
      workKeyId,
      UcKey,
      UcAuthCode
    );
    var result = ['-1', 'OK'];
    result[0] = Number.toString(response);
    if (response == 0) {
      kcv = new String(UcAuthCode.getBytes());
      result[1] = kcv;
    }
    return result;
  },

  activateWorkKey: async (masterKeyId, workKeyId) => {
    return await KMY350XLibrary.ActivateWorkKey(masterKeyId, workKeyId);
  },

  reset: async (type) => {
    var response = await KMY350XLibrary.DevReset(type);
    return response;
  },

  setAccount: async (cardNumber) => {
    var UcAccount = Buffer.from(cardNumber);
    var response = await KMY350XLibrary.SetAccount(UcAccount);
    return response;
  },

  setClientSN: async (clientSN) => {
    var UcClientSN = Buffer.alloc(256);
    UcClientSN.type = ref.types.byte;
    UcClientSN.setBytes(clientSN.getBytes());
    var response = await KMY350XLibrary.SetClientSN(UcClientSN);
    return response;
  },

  addMac: async (mac, type) => {
    var UcMacStr = Buffer.alloc(256);
    UcMacStr.type = ref.types.byte;
    UcMacStr.setBytes(mac.getBytes());
    var UcMacStrResult = Buffer.alloc(256);
    var response = await KMY350XLibrary.MACAdd(UcMacStr, UcMacStrResult, type);
    return response;
  },

  startPin: async (PinLen, AddMode, TimeOut) => {
    var response = await KMY350XLibrary.PinStart(PinLen, AddMode, TimeOut);
    return response;
  },

  /**
   * Get the secrete text (pinblock) from EPP?read the ciphertext after PIN
   * algorithm?
   *
   * @return
   */
  readPinBlock: async () => {
    var UcPinBloc = Buffer.alloc(16);
    UcPinBloc.type = ref.types.byte;
    var response = await KMY350XLibrary.ReadPinBlock(UcPinBloc);
    console.log(response);
    if (response == 0) {
      var pinblock = ref.readCString(UcPinBloc, 0);
      return pinblock;
    }
    return '';
  },

  encrypt: async (UcData, UcReData) => {
    var response = await KMY350XLibrary.DataAdd(UcData, UcReData);
    return response;
  },

  decrypt: async (UcData, UcReData) => {
    var response = await KMY350XLibrary.DataUnAdd(UcData, UcReData);
    return response;
  },

  iCReadPinBlock: async (UcData, UcReData) => {
    var response = await KMY350XLibrary.ICReadPinBlock(UcData, UcReData);
    return response;
  },

  iCSendAPDU: async (UcData, UcReData) => {
    var response = await KMY350XLibrary.ICSendAPDU(UcData, UcReData);
    return response;
  },

  iCPowerOn: async (UcReData) => {
    var response = await KMY350XLibrary.ICPowerOn(UcReData);
    return response;
  },

  iCPowerOff: async () => {
    var response = await KMY350XLibrary.ICPowerOff();
    return response;
  },

  iCReadType: async (ISeat, UcType) => {
    var response = await KMY350XLibrary.ICReadType(ISeat, UcType);
    return response;
  },

  iCSetType: async (ISeat, UcType) => {
    var response = await KMY350XLibrary.ICSetType(ISeat, UcType);
    return response;
  },
};

module.exports = PinPad;
