function test() {
    if (!localStorage) {
        return false;
    }

    if (!SHA1) {
        return false;
    }

    return true;
}


var MAPPING = {
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'xrp': 'ripple',
    'ltc': 'litecoin',
    'etc': 'ethereum-classic',
    'dash': 'dash',
    'nem': 'nem',
    'miota': 'iota',
    'xmr': 'monero',
    'bts': 'bitshares',
    'strat': 'stratis',
    'eos': 'eos',
    'zcash': 'zcash'
};

var USER_ID = 'minky';
var KEY = 'foobar';

var prices = {
    'btc': [1.0, 2589.0],
    'eth': [0.11, 284.79]
};

var portfolio = {
    'btc': 1.200001,
    'eth': 0.005
};

function updatePrices() {
    var url = 'https://api.coinmarketcap.com/v1/ticker/';
    for (var symbol in portfolio) {
        var url_id = MAPPING[symbol];
        if (url_id) {
            get(url + url_id, function() {
                var response = JSON.parse(this.responseText);
                var data = response[0];
                prices[data.symbol.toLowerCase()] = [data.price_btc, data.price_usd];
                console.log('updating price of ' + data.symbol.toLowerCase() + ' as ' + data.price_usd + '$');
            });
        }
    }
}

function get(url, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener("load", callback);
    req.setRequestHeader('User-agent', 'curl/7.51.0');
    req.setRequestHeader('Accept', '*/*');
    req.open("GET", url);
    req.send();
}

function save(key, jsonData) {
    localStorage.setItem(key, JSON.stringify(jsonData));
}

function load(key) {
    return JSON.parse(localStorage.getItem(key));
}

function renderInputKey() {
    var html = '<form class="auth">'
        + 'ID <input type="text" name="id">'
        + 'KEY <input type="text" name="key">'
        + '<button type="submit" class="do-auth"></button>'
        + '</form>';

    document.querySelector('.auth-form').innerHTML = html;

    document.querySelector('.auth-form button').addEventListener('click', function(e) {
       e.preventDefault();

        USER_ID = document.querySelector('.auth-form input[name=id]').value;
        KEY = document.querySelector('.auth-form input[name=key]').value;

        document.querySelector('.auth').remove();
    });
}

function renderFolio(holdings, prices) {
    var html = '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">\
        <thead>\
        <tr>\
        <th class="mdl-data-table__cell--non-numeric">Coin</th>\
        <th>Quantity</th>\
        <th>Unit price (USD)</th>\
        <th>Total (USD)</th>\
        <th>Action</th>\
    </tr>\
    </thead>\
    <tbody>';

    for (var k in holdings) {
        var kQuantity = holdings[k];
        var kPriceDollar = prices[k][1];
        html += '<tr>\
            <td class="mdl-data-table__cell--non-numeric">' + k + '</td>\
            <td>' + kQuantity + '</td>\
            <td>' + kPriceDollar + '</td>\
            <td>' + kQuantity * kPriceDollar+ '</td>\
            <td><button data-symbol="' + k + '" class="mdl-button mdl-js-button mdl-js-ripple-effect symbol-eidt">Edit</button><button data-symbol="' + k + '" class="mdl-button mdl-js-button mdl-js-ripple-effect symbol-remove">Remove</button></td>\
        </tr>';
    }

    html += '</tbody></table>';

    document.querySelector('.portfolio_table').innerHTML = html;
}

function editSymbol(symbol) {

}

function removeSymbol(symbol) {

}

function addSymbol(event) {
    event.stopImmediatePropagation();
    var form = document.querySelector('.add-symbol-form');
    var symbol = form.querySelector('input[name=symbol]').value;
    var quantity = form.querySelector('input[name=q]').value;

    // check exists
    if (portfolio[symbol]) {
        var nq = portfolio[symbol] + quantity;
        portfolio[symbol] = nq;
    } else {
        portfolio[symbol] = quantity;
    }

    renderFolio(portfolio, prices);

    var snackbarContainer = document.querySelector('#demo-snackbar-example');

    snackbarContainer.MaterialSnackbar.showSnackbar(symbol + " added to your portfolio");
}

function addActionHandlers() {
    document.addEventListener('click', function(e) {
        if (e.target.class == 'symbol-edit') {
            editSymbol(e.target.dataset.symbol);
        }
        if (e.target.class == 'symbol-remove') {
            removeSymbol(e.target.dataset.symbol);
        }
        if (e.target.class == 'symbol-add') {
            addSymbol(e);
        }
    }, { passive: true, capture: true });
}

function init() {
    if (test() === true) {
        renderFolio(portfolio, prices);
        setInterval(updatePrices, 60000);
    }
}

init();

