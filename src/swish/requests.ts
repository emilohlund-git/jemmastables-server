/* import request from 'request';
import { testConfig } from './swish';
import fs from 'fs';

function requestOptions(method: string, uri: string | undefined, body: { payeePaymentReference?: string; callbackUrl?: string; payeeAlias?: string; payerAlias?: any; amount?: any; currency?: string; message?: any; token?: any; size?: string; format?: string; border?: string; } | undefined) {
  return {
    method: method,
    uri: uri,
    json: true,
    body: body,
    'content-type': 'application/json',
    cert: fs.readFileSync(testConfig.cert),
    key: fs.readFileSync(testConfig.key),
    ca: testConfig.ca ? fs.readFileSync(testConfig.ca) : null,
    passphrase: testConfig.passphrase,
  };
}

function logResult(error: any, response: request.Response) {
  if (error) {
    console.log(error);
  }
  if (response) {
    console.log(response.statusCode);
    console.log(response.headers);
    console.log(response.body);
  }
}

// Create Payment Request
app.post('/paymentrequests', function (req: { body: { payerAlias: any; amount: any; message: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: any): void; new(): any; }; }; json: (arg0: { url: string | undefined; token: string | string[] | undefined; id: any; }) => void; send: (arg0: any) => void; }) {
  // NOTE: the callbackUrl will be called by the swish system when the status of the
  //       payment is changed. This will normally be an endpoint in the merchants system.
  //       Since this sample is likely run on a local machine, we can't really act on the
  //       callback. We entered this example here that is using a service that lets you see
  //       how the callback looks. To see it in action, open https://webhook.site in a browser
  //       and replace the callbackUrl below with your unique url
  const json = {
    payeePaymentReference: '0123456789',
    callbackUrl: 'https://webhook.site/f641832d-b07a-4700-9d44-0f2e47e5ba6b',
    payeeAlias: testConfig.payeeAlias,
    payerAlias: req.body.payerAlias,
    amount: req.body.amount,
    currency: 'SEK',
    message: req.body.message,
  };

  const options = requestOptions(
    'POST',
    `${testConfig.host}/api/v1/paymentrequests`,
    json
  );

  request(options, (error, response, body) => {
    logResult(error, response);

    if (!response) {
      res.status(500).send(error);
      return;
    }

    res.status(response.statusCode);
    if (response.statusCode == 201) {
      // Payment request was successfully created. In order to get the details of the
      // newly created request, we need to make a GET request to the url in the location header

      const location = response.headers['location'];
      const token = response.headers['paymentrequesttoken'];

      const opt = requestOptions('GET', location);

      request(opt, (err, resp, bod) => {
        logResult(err, resp);

        if (!response) {
          res.status(500).send(error);
          return;
        }

        const id = resp.body['id'];

        res.json({
          url: location,
          token: token,
          id: id,
        });
      });
    } else {
      res.send(body);
      return;
    }
  });
});

// Get Payment Request
app.get('/paymentrequests/:requestId', function (req: { params: { requestId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: any): void; new(): any; }; }; json: (arg0: { id: any; paymentReference: any; status: any; }) => void; send: (arg0: any) => void; }) {
  const options = requestOptions(
    'GET',
    `${testConfig.host}/api/v1/paymentrequests/${req.params.requestId}`
  );

  request(options, (error, response, body) => {
    logResult(error, response);

    if (!response) {
      res.status(500).send(error);
      return;
    }

    res.status(response.statusCode);
    if (response.statusCode == 200) {
      res.json({
        id: response.body['id'],
        paymentReference: response.body['paymentReference'] || '',
        status: response.body['status'],
      });
    } else {
      res.send(body);
      return;
    }
  });
});

// Get QR Code
app.get('/qr/:token', function (req: { params: { token: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: any): void; new(): any; }; }; }) {
  const token = req.params.token;

  const json = {
    token: token,
    size: '600',
    format: 'png',
    border: '0',
  };

  const options = requestOptions(
    'POST',
    `${testConfig.qrHost}/api/v1/commerce`,
    json
  );

  request(options, (error, response, body) => {
    logResult(error, response);

    if (!response) {
      res.status(500).send(error);
      return;
    }
  }).pipe(res);
});
 */