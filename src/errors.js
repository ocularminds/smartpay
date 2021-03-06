const ResultValues = {
  "0": "Success",
  "-99": "Negative Response(Communication Error/Device not connected)",
  "-31": "Open COM fail",
  "-32": "Close COM fail",
  "35": "IC card not electrified",
  "21": "Parameter of command error",
  "128": "Timeout error",
  "164": "Command executed OK, but MK invalid",
  "181": "Command invalid, and MK invalid",
  "196": "Command execute OK, but battery maybe fail",
  "213": "Command invalid, and battery maybe fail",
  "224": "Invalid command",
  "240": "CPU selftest error",
  "241": "SRAM selftest error",
  "242": "Shortcircut selftest error",
  "243": "COM voltage selftest error",
  "244": "CPU card selftest error",
  "245": "Battery selftest fail",
  "246": "MK selftest fail",
};
module.exports = ResultValues
