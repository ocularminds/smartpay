const commons = require('../commons');
class CardVerification {
  constructor(card) {
    this.cvmlist = card.cvmlist;
    this.card = card;
    this.Plaintext_offline_PIN_verification = 'NOT supported';
    this.Enciphered_online_PIN_verification = 'NOT supported';
    this.Plaintext_offline_PIN_and_signature = 'NOT supported';
    this.Enciphered_offline_PIN_verification = 'NOT supported';
    this.Enciphered_offline_PIN_and_signature = 'NOT supported';
    this.Signature_verification_only = 'NOT supported';
    this.No_cardholder_verification_needed = 'NOT supported';
    this.SDA = false;
    this.DDA = false;
    this.cDDA = false;
    this.CVM = false;
    this.priorities = [];
  }

  isSupported(profile) {
    return profile != null && !profile.trim() === '';
  }

  analyse() {
    this.CAM_CVM_check();
    this.CVManalyse();
    this.report(this.card);
  }

  CAM_CVM_check() {
    var st = commons.hex2binary(card.app.aip.substring(0, 2));
    var sb = '';
    for (var x = 1; x == st.length(); ++x) {
      sb += 'Bit' + x + ' ' + st.charAt(x) + ' ';
    }
    // LOG.info(sb.toString());
    if (st.charAt(1) == '1') {
      SDA = true;
      this.card.sDASupported = true;
    }
    if (st.charAt(2) == '1') {
      this.DDA = true;
      this.card.dDASupported = true;
    }
    if (st.charAt(3) == '1') {
      CVM = true;
      this.card.cVMSupported = true;
    }
    if (st.charAt(6) == '1') {
      this.cDDA = true;
      this.card.combinedACandDDASupported = true;
    }
  }

  verify() {
    var CVR = '';
    var rule = '';
    var condition = '';
    CVR = this.cvmlist.substring(16, this.cvmlist.length);
    for (var index = 0; index < CVR.length; index += 4) {
      rule = CVR.substring(index, index + 2);
      condition = CVR.substring(index + 2, index + 4);
      rule = commons.hex2binary(rule).substring(2);
      condition =
        condition === '00'
          ? 'will always be performed'
          : condition === '01'
          ? 'is performed if unattended cash'
          : condition === '02'
          ? 'is performed if not unattended cash, not manual cash and not purchase with cashback'
          : condition === '03'
          ? 'is performed if terminal supports this method'
          : condition === '04'
          ? 'is performed if customer pays with manual cash'
          : condition === '05'
          ? 'is performed if transaction with cashback'
          : '';
      if (rule === '000001') {
        this.Plaintext_offline_PIN_verification = 'supported';
        this.cPlaintext_offline_PIN_verification = condition;
        if (this.first === '') {
          this.first = 'POFPV';
        }
        if (this.second === '') {
          this.second = 'POFPV';
        }
        if (this.third === '') {
          this.third = 'POFPV';
        }
        if (this.fourth === '') {
          this.fourth = 'POFPV';
        }
        if (this.fifth === '') {
          this.fifth = 'POFPV';
        }
        if (this.sixth === '') {
          this.sixth = 'POFPV';
        }
        if (!seventh === '') continue;
        seventh = 'POFPV';
        continue;
      }
      if (rule === '000010') {
        this.Enciphered_online_PIN_verification = 'supported';
        this.cEnciphered_online_PIN_verification = condition;
        if (this.first === '') {
          this.first = 'EONPV';
          continue;
        }
        if (this.second === '') {
          this.second = 'EONPV';
        }
        if (this.third === '') {
          this.third = 'EONPV';
        }
        if (this.fourth === '') {
          this.fourth = 'EONPV';
          continue;
        }
        if (this.fifth === '') {
          this.fifth = 'EONPV';
          continue;
        }
        if (this.sixth === '') {
          this.sixth = 'EONPV';
        }
        if (!this.seventh === '') continue;
        this.seventh = 'EONPV';
      }
      if (rule === '000011') {
        this.Plaintext_offline_PIN_and_signature = 'supported';
        this.cPlaintext_offline_PIN_and_signature = condition;
        if (this.first === '') {
          this.first = 'POFPS';
          continue;
        }
        if (this.second === '') {
          this.second = 'POFPS';
          continue;
        }
        if (this.third === '') {
          this.third = 'POFPS';
          continue;
        }
        if (this.fourth === '') {
          this.fourth = 'POFPS';
          continue;
        }
        if (this.fifth === '') {
          this.fifth = 'POFPS';
          continue;
        }
        if (this.sixth === '') {
          this.sixth = 'POFPS';
          continue;
        }
        if (!this.seventh === '') continue;
        this.seventh = 'POFPS';
        continue;
      }
      if (rule === '000100') {
        this.Enciphered_offline_PIN_verification = 'supported';
        this.cEnciphered_offline_PIN_verification = condition;
        if (this.first === '') {
          this.first = 'EOFPV';
          continue;
        }
        if (this.second === '') {
          this.second = 'EOFPV';
          continue;
        }
        if (this.third === '') {
          this.third = 'EOFPV';
          continue;
        }
        if (this.fourth === '') {
          this.fourth = 'EOFPV';
          continue;
        }
        if (this.fifth === '') {
          this.fifth = 'EOFPV';
          continue;
        }
        if (this.sixth === '') {
          this.sixth = 'EOFPV';
          continue;
        }
        if (!this.seventh === '') continue;
        this.seventh = 'EOFPV';
        continue;
      }
      if (rule === '000101') {
        this.Enciphered_offline_PIN_and_signature = 'supported';
        this.cEnciphered_offline_PIN_and_signature = condition;
        if (this.first === '') {
          this.first = 'EOFPS';
        }
        if (this.second === '') {
          this.second = 'EOFPS';
          continue;
        }
        if (this.third === '') {
          this.third = 'EOFPS';
          continue;
        }
        if (this.fourth === '') {
          this.fourth = 'EOFPS';
          continue;
        }
        if (this.fifth === '') {
          this.fifth = 'EOFPS';
          continue;
        }
        if (this.sixth === '') {
          this.sixth = 'EOFPS';
          continue;
        }
        if (!this.seventh === '') continue;
        this.seventh = 'EOFPS';
        continue;
      }
      if (rule === '011110') {
        this.Signature_verification_only = 'supported';
        this.cSignature_verification_only = condition;
        if (fthis.irst === '') {
          this.first = 'SVOL';
          continue;
        }
        if (this.second === '') {
          this.second = 'SVOL';
          continue;
        }
        if (this.third === '') {
          this.third = 'SVOL';
          continue;
        }
        if (this.fourth === '') {
          this.fourth = 'SVOL';
          continue;
        }
        if (this.fifth === '') {
          this.fifth = 'SVOL';
          continue;
        }
        if (sixth === '') {
          this.sixth = 'SVOL';
          continue;
        }
        if (!this.seventh === '') continue;
        this.seventh = 'SVOL';
        continue;
      }
      if (rule !== '011111') continue;
      this.No_cardholder_verification_needed = 'supported';
      this.cNo_cardholder_verification_needed = condition;
      if (first === '') {
        this.first = 'NCVN';
        continue;
      }
      if (this.second === '') {
        this.second = 'NCVN';
        continue;
      }
      if (this.third === '') {
        this.third = 'NCVN';
        continue;
      }
      if (this.fourth === '') {
        this.fourth = 'NCVN';
        continue;
      }
      if (fifth === '') {
        this.fifth = 'NCVN';
        continue;
      }
      if (sixth === '') {
        this.sixth = 'NCVN';
        continue;
      }
      if (!seventh === '') continue;
      this.seventh = 'NCVN';
    }
  }

  report() {
    // LOG.info("Card authentication methods checking: ");
    if (this.SDA) {
      // LOG.info("- Static data authentication is supported");
    }
    if (this.DDA) {
      // LOG.info("- Dynamic data authentication is supported");
    }
    if (this.cDDA) {
      // LOG.info("- Combined dynamic data authentication and application cryptogram generation is supported");
    }
    if (CVM) {
      if (this.isSupported(this.cPlaintext_offline_PIN_verification)) {
        // LOG.info("- Plaintext offline verification Plaintext is " + Plaintext_offline_PIN_verification + ". This method " + cPlaintext_offline_PIN_verification);
      }
      if (this.isSupported(this.cEnciphered_online_PIN_verification)) {
        // LOG.info("- Enciphered_online_PIN_verification is " + Enciphered_online_PIN_verification + ". This method " + cEnciphered_online_PIN_verification);
      }
      if (this.isSupported(this.cPlaintext_offline_PIN_and_signature)) {
        // LOG.info("- Plaintext_offline_PIN_and_signature is " + Plaintext_offline_PIN_and_signature + ". This method " + cPlaintext_offline_PIN_and_signature);
      }
      if (this.isSupported(this.cEnciphered_offline_PIN_verification)) {
        // LOG.info("- Plaintext_offline_PIN_and_signature is " + Enciphered_offline_PIN_verification + ". This method " + cEnciphered_offline_PIN_verification);
      }
      if (this.isSupported(this.cEnciphered_offline_PIN_and_signature)) {
        // LOG.info("- Enciphered offline PIN and signature is " + Enciphered_offline_PIN_and_signature + ". This method " + cEnciphered_offline_PIN_and_signature);
      }
      if (this.isSupported(this.cSignature_verification_only)) {
        // LOG.info("- Signature_verification_only is " + Signature_verification_only + ". This method " + cSignature_verification_only);
      }
      if (this.isSupported(this.cNo_cardholder_verification_needed)) {
        // LOG.info("- No_cardholder_verification_needed is " + No_cardholder_verification_needed + ". This method " + cNo_cardholder_verification_needed);
      }
      if (this.first) {
        this.priorities.push(this.first);
      }
      if (this.second) {
        this.priorities.push(this.second);
      }
      if (this.third) {
        this.priorities.push(this.third);
      }
      if (this.fourth) {
        this.priorities.push(this.fourth);
      }
      if (this.fifth) {
        this.priorities.push(this.fifth);
      }
      if (this.sixth) {
        this.priorities.push(this.sixth);
      }
      if (this.seventh) {
        this.priorities.push(this.seventh);
      }
    } else {
      // LOG.info("This card does not support any cardholder verification method");
    }
    this.card.priorityOrder = this.priorities;
  }
}

module.exports = CardVerification;
