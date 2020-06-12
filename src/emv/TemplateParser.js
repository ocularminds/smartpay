const commons = require('../commons');
const TLV = require('node-tlv');
const Application = require('./Application');
const Card = require('./Card');

const TemplateParser = {
  parseTags: (data) => {
    const tags = {};
    let tl = commons.trim(data);
    let tlv = null;
    while (tl.length > 0) {
      tlv = TLV.parse(tl);
      const len = tlv.tag.length;
      tags[tlv.tag] = tl.substring(len, len + 2);
      if (!tlv.value) {
        return tags;
      } else {
        tl = tl.substring(len + 2, tl.length);
      }
    }
    return tags;
  },
  parse: async (data, app) => {
    if (data == null || data.length == 0) {
      return;
    }
    const tdata = commons.trim(data);
    var tlv = await TLV.parse(tdata);
    if (tlv.child.length > 0) {
      await TemplateParser.parseFields(tlv.child, app);
    }
  },
  parseFields: (children, app, level = 0) => {
    const dept = level;
    var tabs = '';
    for (let x = 0; x < dept; x++) {
      tabs += '\t';
    }
    children.forEach((tlv) => {
      if (tlv.child.length > 0) {
        TemplateParser.parseFields(tlv.child, app, dept + 1);
      } else {
        console.log(tabs, tlv.tag, tlv.value, tlv.name);
        if (tlv.tag === '42') {
          app.bin = tlv.value;
        }
        if (tlv.tag === '82') {
          app.aip = tlv.value;
        }
        if (tlv.tag === '84') {
          app.aid = tlv.value;
        }
        if (tlv.tag === '50') {
          app.label = commons.hex2ascii(tlv.value);
        }
        if (tlv.tag === '87') {
          app.priority = tlv.value;
        }
        if (tlv.tag === '9F38') {
          app.pdol = tlv.value;
        }
        if (tlv.tag === '9F4D') {
          app.logs = tlv.value;
        }
        if (tlv.tag === '5F2D') {
          app.language = commons.hex2ascii(tlv.value);
        }
        if (tlv.tag === '5F56') {
          app.country = commons.hex2ascii(tlv.value);
        }
      }
    });
  },
  parseFci: async (data, app) => {
    if (data == null || data.length == 0) {
      return;
    }
    const tdata = commons.trim(data);
    var tlv = await TLV.parse(tdata);
    var afl = [];
    if (tlv.child.length > 0) {
      await TemplateParser.parseFciFields(tlv.child, app);
    }
    if (app.afl && app.afl.length > 7) {
      afl[0] = app.afl.substring(0, 8);
    }
    if (app.afl && app.afl.length > 15) {
      afl[1] = app.afl.substring(8, 16);
    }
    if (app.afl && app.afl.length > 23) {
      afl[2] = app.afl.substring(16, 24);
    }
    app.files = afl;
  },
  parseFciFields: (children, app, level = 0) => {
    const dept = level;
    var tabs = '';
    for (let x = 0; x < dept; x++) {
      tabs += '\t';
    }
    children.forEach((tlv) => {
      if (tlv.child.length > 0) {
        TemplateParser.parseFciFields(tlv.child, app, dept + 1);
      } else {
        console.log(tabs, tlv.tag, tlv.value, tlv.name);
        if (tlv.tag === '82') {
          app.aip = tlv.value;
        }
        if (tlv.tag === '84') {
          app.aid = tlv.value;
        }
        if (tlv.tag === '87') {
          app.api = tlv.value;
        }
        if (tlv.tag === '94') {
          app.afl = tlv.value;
        }
      }
    });
  },
  parseSfi: async (data, card) => {
    if (data == null || data.length == 0) {
      return;
    }
    const tdata = commons.trim(data);
    var tlv = await TLV.parse(tdata);
    //console.log(tlv);
    if (tlv.child.length > 0) {
      await TemplateParser.parseSfiFields(tlv.child, card);
    }
  },
  parseSfiFields: (children, card, level = 0) => {
    const dept = level;
    var tabs = '';
    for (let x = 0; x < dept; x++) {
      tabs += '\t';
    }
    children.forEach((tlv) => {
      if (tlv.child.length > 0) {
        TemplateParser.parseSfiFields(tlv.child, card, dept + 1);
      }
      //console.log(tlv);
      console.log(tabs, tlv.tag, tlv.value, tlv.name);
      if (tlv.tag === '5F20') {
        card.cardholder = commons.hex2ascii(tlv.value);
      }
      if (tlv.tag === '9F1F') {
        card.discretionary = tlv.value;
      }
      if (tlv.tag === '57') {
        card.track2 = tlv.value;
        const t = card.track2.split('D');
        card.pan = t[0];
        if (t.length > 1) {
          card.track2 = t[0] + '=' + t[1];
          card.expiry = t[1].substring(0, 4);
        }
      }
      if (tlv.tag === '5F24') {
        card.expiry = tlv.value;
        const expiry = new Date(Date.parse(card.expiry));
        console.log('card expiry ->', expiry.toISOString());
        card.status = expiry > new Date() ? 'ACTIVE' : 'EXPIRED';
        //new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
      }
      if (tlv.tag === '5F25') {
        card.effdate = tlv.value;
      }
      if (tlv.tag === '5A') {
        card.pan = tlv.value;
      }
      if (tlv.tag === '5F34') {
        card.sequence = tlv.value;
      }
      if (tlv.tag === '9F07') {
        card.usagecontrol = tlv.value;
      }
      if (tlv.tag === '8E') {
        card.cvmlist = tlv.value;
      }
      if (tlv.tag === '5F2D') {
        card.language = commons.hex2ascii(tlv.value);
      }
      if (tlv.tag === '9F0D') {
        card.iacdefault = tlv.value;
      }
      if (tlv.tag === '9F0E') {
        card.iacdenial = tlv.value;
      }
      if (tlv.tag === '9F0F') {
        card.iaconline = tlv.value;
      }
      if (tlv.tag === '5F28') {
        card.countryCode = tlv.value;
      }
      if (tlv.tag === '9F42') {
        card.currencyCode = tlv.value;
      }
      if (tlv.tag === '9F44') {
        card.currencyIndex = tlv.value;
      }
      if (tlv.tag === '9F4A') {
        card.sdaTags = tlv.value;
      }
      if (tlv.tag === '9F08') {
        card.versionNumber = tlv.value;
      }
      if (tlv.tag === '5F30') {
        card.serviceCode = tlv.value;
      }
      if (tlv.tag === '8C') {
        card.CDOL1 = tlv.value;
      }
      if (tlv.tag === '8D') {
        card.CDOL2 = tlv.value;
      }
      if (tlv.tag === '9F49') {
        card.DDOL = tlv.value;
      }
      if (tlv.tag === '8F') {
        card.CA_PKI = tlv.value;
      }
      if (tlv.tag === '90') {
        card.ISSUER_PK_CERT = tlv.value;
      }
      if (tlv.tag === '9F32') {
        card.ISSUER_PKE = tlv.value;
      }
      if (tlv.tag === '92') {
        card.ISSUER_PKR = tlv.value;
      }
      if (tlv.tag === '93') {
        card.ssad = tlv.value;
      }
    });
  },
};
module.exports = TemplateParser;