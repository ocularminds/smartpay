const command = new CommandApdu();
const apdu = command.apduPdol('9F35019F40059F3303');
//80 A8 00 00 28    30 220000000000E0F8C8 00
//80 A8 00 00 0B 83 09 220000000000E0F8C8 00
console.log('Build PDOL: APDU ->', apdu);
