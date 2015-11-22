var braintree = require('braintree');
var conf = require('nconf');
var Dion = require('dion');
var http = require('http');
var requestData = require('request-data');
var SeaLion = require('sea-lion');
var dion, gateway, router, server;

var blocks = {
    1: true,
    2: true,
    9: true,
    10: true,
    28: true,
    36: true,
    37: true,
    41: true,
    50: true
};
var longs = [];

var BRICK_PRICE = '1.00';

conf.argv().env().file({file: 'config.json'});


gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: conf.get('braintree.merchantId'),
    publicKey: conf.get('braintree.publicKey'),
    privateKey: conf.get('braintree.privateKey')
});

router = new SeaLion();
dion = new Dion(router);

router.add({
    '/': dion.serveFile('public/index.html', 'text/html'),
    '/styles/`path...`': dion.serveDirectory('./public/styles', {
        '.css': 'text/css'
    }),
    '/scripts/`path...`': dion.serveDirectory('./public/scripts', {
        '.js': 'application/json'
    }),
    '/init': {
        GET: requestData(function (request, response, tokens, data) {
            response.end(JSON.stringify(Object.keys(blocks)));
        })
    },
    '/long': {
        GET: requestData(function (request, response, tokens, data) {
            longs.push(response);
        })
    },
    '/buy': {
        POST: requestData(function (request, response, tokens, data) {
            bought(data.id);
            response.end(JSON.stringify(data));
        })
    },
    '/client_token': {
        GET: function (request, response) {
            gateway.clientToken.generate({}, function (err, gatewayResponse) {
                response.end(JSON.stringify(gatewayResponse.clientToken));
            });
        }
    },
    '/checkout': {
        POST: requestData(function (request, response, tokens, data) {
            gateway.transaction.sale({
                amount: BRICK_PRICE,
                // paymentMethodNonce: data.payment_method_nonce,
                paymentMethodNonce: 'fake-valid-nonce',
                options: {
                    submitForSettlement: true
                }
            }, function (err, result) {
                if (err) {
                    console.error(err);
                } else {
                    bought(data['brick-buying']);
                }

                response.statusCode = 301;
                response.setHeader('Location', '/');
                response.end();
            });
        })
    }
});

function bought(id) {
    blocks[id] = true;

    while (longs.length) {
        longs.pop().end(JSON.stringify(Object.keys(blocks)))
    }
}

server = http.createServer(router.createHandler());
server.listen(conf.get('port'));
