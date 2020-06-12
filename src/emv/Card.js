const Application = require('./Application');
class Card {
  PLAINTEXT_OFFLINE_PIN_VERIFICATION = 'POFPV';
  ENCIPHERED_ONLINE_PIN_VERIFICATION = 'EONPV';
  PLAINTEXT_OFFLINE_PIN_AND_SIGNATURE = 'POFPS';
  ENCIPHERED_OFFLINE_PIN_VERIFICATION = 'EOFPV';
  ENCIPHERED_OFFLINE_PIN_AND_SIGNATURE = 'EOFPS';
  SIGNATURE_VERIFICATION_ONLY = 'SVOL';
  NO_CARDHOLDER_VERIFICATION_NEEDED = 'NCVN';

  constructor(app = new Application()) {
    this.app = app;
    this.priorityOrder = [];
  }
}
module.exports = Card;
