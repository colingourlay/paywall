(function () {

    var NUM_BRICKS = 72;
    var IFRAME_URL = 'http://www.abc.net.au/news/';

    var bricks = [];
    var bricksEl = document.getElementById('bricks');
    var paymentEl = document.getElementById('payment');
    var brickBuyingEl = document.getElementById('brick-buying');
    var cancelEl = document.getElementById('cancel');
    var focusedBrickId;

    while (bricks.length < NUM_BRICKS) {
        (function () {
            var brickEl = document.createElement('div');
            var id = bricks.length;

            brickEl.className = 'Brick';
            brickEl.id = 'Brick' + id;
            brickEl.style.top = (id - (id % 8)) / 8 * 11.1111 + 'vh';
            brickEl.style.left = (id % 8) * 13.75 + 'vw';
            brickEl.style.transform = 'translate(' + ((id % 16 < 8) ? '-62.5%' : '-12.5%') + ',0)';
            brickEl.onclick = function () {
                brickEl.className = brickEl.className + ' is-buying';
                brickBuyingEl.value = id;
                focusedBrickId = id;
                paymentEl.style.display = 'block';
            };
            bricks.push(brickEl);
            bricksEl.appendChild(brickEl);
        })();
    }

    cancelEl.onclick = function () {
        if (typeof focusedBrickId === 'number') {
            bricks[focusedBrickId].className = bricks[focusedBrickId].className.replace(' is-buying', '');
        }
        focusedBrickId = null;
        brickBuyingEl.value = '';
        paymentEl.style.display = 'none';
    }

    function boughtBrick(id) {
        if (id && id !== "undefined") {
            bricks[id].className = bricks[id].className.replace(' is-buying', '');
            bricks[id].style.display = 'none';
        }
    }

    function xhr(method, url, data, done) {
        var client = new XMLHttpRequest();

        client.open(method, url, true);
        client.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        client.onload = function () {
            if (client.readyState === 4) {
                if (client.status === 200) {
                    done(JSON.parse(client.responseText));
                } else {
                    console.error(client.statusText);
                }
            }
        };
        client.onerror = function () {
            console.error(client.statusText);
        };
        client.send(JSON.stringify(data));
    }

    xhr('GET', 'init', {}, function (data) {
        data.forEach(boughtBrick);

        function poll() {
            xhr('GET', 'long', {}, function (data) {
                data.forEach(boughtBrick);
                poll();
            });
        }

        poll();
    });

    var iframeEl = document.createElement('iframe');

    iframeEl.src = IFRAME_URL;
    iframeEl.width = '100%';
    iframeEl.height = '100%';
    iframeEl.frameBorder = '0';
    document.body.insertBefore(iframeEl, bricksEl);

    var BRAINTREE_CLIENT_TOKEN = 'eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiJhMDA3MmZiODg3Mjk3MjA0M2E3ZjJhZjBhMTI1OGRlYjY2ZjM2ODIzYmNmNzFiNWJmYmM5ZGY2YjkxYjdiMWIwfGNyZWF0ZWRfYXQ9MjAxNS0xMS0yMlQwMTozNTowNi40MDAyMjU1NzUrMDAwMFx1MDAyNm1lcmNoYW50X2lkPTM0OHBrOWNnZjNiZ3l3MmJcdTAwMjZwdWJsaWNfa2V5PTJuMjQ3ZHY4OWJxOXZtcHIiLCJjb25maWdVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvMzQ4cGs5Y2dmM2JneXcyYi9jbGllbnRfYXBpL3YxL2NvbmZpZ3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbXSwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwiY2xpZW50QXBpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzLzM0OHBrOWNnZjNiZ3l3MmIvY2xpZW50X2FwaSIsImFzc2V0c1VybCI6Imh0dHBzOi8vYXNzZXRzLmJyYWludHJlZWdhdGV3YXkuY29tIiwiYXV0aFVybCI6Imh0dHBzOi8vYXV0aC52ZW5tby5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIiwiYW5hbHl0aWNzIjp7InVybCI6Imh0dHBzOi8vY2xpZW50LWFuYWx5dGljcy5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIn0sInRocmVlRFNlY3VyZUVuYWJsZWQiOnRydWUsInRocmVlRFNlY3VyZSI6eyJsb29rdXBVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvMzQ4cGs5Y2dmM2JneXcyYi90aHJlZV9kX3NlY3VyZS9sb29rdXAifSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImRpc3BsYXlOYW1lIjoiQWNtZSBXaWRnZXRzLCBMdGQuIChTYW5kYm94KSIsImNsaWVudElkIjpudWxsLCJwcml2YWN5VXJsIjoiaHR0cDovL2V4YW1wbGUuY29tL3BwIiwidXNlckFncmVlbWVudFVybCI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBheXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJhbGxvd0h0dHAiOnRydWUsImVudmlyb25tZW50Tm9OZXR3b3JrIjp0cnVlLCJlbnZpcm9ubWVudCI6Im9mZmxpbmUiLCJ1bnZldHRlZE1lcmNoYW50IjpmYWxzZSwiYnJhaW50cmVlQ2xpZW50SWQiOiJtYXN0ZXJjbGllbnQzIiwiYmlsbGluZ0FncmVlbWVudHNFbmFibGVkIjp0cnVlLCJtZXJjaGFudEFjY291bnRJZCI6ImFjbWV3aWRnZXRzbHRkc2FuZGJveCIsImN1cnJlbmN5SXNvQ29kZSI6IlVTRCJ9LCJjb2luYmFzZUVuYWJsZWQiOmZhbHNlLCJtZXJjaGFudElkIjoiMzQ4cGs5Y2dmM2JneXcyYiIsInZlbm1vIjoib2ZmIn0=';

    braintree.setup(BRAINTREE_CLIENT_TOKEN, 'dropin', {
        container: 'payment-form'
    });

})();
