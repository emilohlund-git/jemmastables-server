const prodConfig = {
  payeeAlias: '12332291292',
  host: 'https://mss.cpc.getswish.net/swish-cpcapi',
  qrHost: 'https://mss.mpc.getswish.net/qrg-swish',
  cert: './ssl/prod.pem',
  key: './ssl/prod.key',
  passphrase: null,
};

const testConfig = {
  payeeAlias: '1231181189',
  host: 'https://mss.cpc.getswish.net/swish-cpcapi',
  qrHost: 'https://mpc.getswish.net/qrg-swish',
  cert: './ssl/Swish_Merchant_TestCertificate_1234679304.pem',
  key: './ssl/Swish_Merchant_TestCertificate_1234679304.key',
  ca: './ssl/Swish_TLS_RootCA.pem',
  passphrase: 'swish',
};

module.exports = {
  prodConfig,
  testConfig,
};
