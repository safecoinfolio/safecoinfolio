function test() {
    if (typeof localStorage === "undefined") {
        return false;
    }

    if (typeof CryptoJS.SHA1 === "undefined") {
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
    'zec': 'zcash',
    'bcc': 'bitconnect',
    'waves': 'waves',
    'steem': 'steem',
    'ans': 'antshares',
    'gno': 'gnosis-gno',
    'gnt': 'golem-network-tokens',
    'bcn': 'bytecoin-bcn',
    'doge': 'dogecoin'
};

var USER_ID = 'minky';
var SECRET_KEY = 'foobar';

var prices = {
    'btc': [1.0, 2589.0]
};

var portfolio = {
};

function updatePriceFor(symbol) {
    var url = 'https://api.coinmarketcap.com/v1/ticker/';
    var url_id = MAPPING[symbol];
    if (url_id) {
        get(url + url_id + '/', function () {
            var response = JSON.parse(this.responseText);
            var data = response[0];
            prices[data.symbol.toLowerCase()] = [data.price_btc, data.price_usd];
            console.log(
                'updating price of ' + data.symbol.toLowerCase() + ' as '
                + data.price_usd + '$');
        });
    }
}

function updatePrices() {

    for (var symbol in portfolio) {
        updatePriceFor(symbol);
    }

}

function get(url, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener("load", callback);
    req.open("GET", url);
    req.setRequestHeader('Accept', '*/*');
    req.send();
}

function save(key, jsonData) {
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(jsonData), SECRET_KEY);
    localStorage.setItem(USER_ID + '_' + key, ciphertext);
}

function load(key) {
    var data = localStorage.getItem(USER_ID + '_' + key);

    if (data === null) {
        return null;
    }

    var bytes  = CryptoJS.AES.decrypt(data, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
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
        SECRET_KEY = document.querySelector('.auth-form input[name=key]').value;

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

        if (kQuantity === 0) {
            continue;
        }

        var kPriceDollar = prices[k] && prices[k].length > 1 ? prices[k][1] : 0;
        html += '<tr>\
            <td class="mdl-data-table__cell--non-numeric">' + k + '</td>\
            <td class="' + k + '_quantity">' + kQuantity + '</td>\
            <td>' + kPriceDollar + '</td>\
            <td>' + kQuantity * kPriceDollar+ '</td>\
            <td><button data-symbol="' + k + '" class="mdl-button mdl-js-button mdl-js-ripple-effect symbol-edit">Edit</button><button data-symbol="' + k + '" class="mdl-button mdl-js-button mdl-js-ripple-effect symbol-remove">Remove</button></td>\
        </tr>';
    }

    html += '</tbody></table>';

    document.querySelector('.portfolio_table').innerHTML = html;

    updateTotal(holdings, prices);
}

function updateTotal(holdings, prices) {
    var total = 0;

    for (var k in holdings) {
        var kQuantity = holdings[k];
        var kPriceDollar = prices[k] && prices[k].length > 1 ? prices[k][1] : 0;

        total += kQuantity * kPriceDollar;
    }

    document.querySelector('.total_usd').innerHTML = total;
}

function editSymbol(symbol) {
    var cell = document.querySelector('.' + symbol + '_quantity');

    if (typeof cell === "undefined") {
        return;
    }

    var html = '<form><input type="number" name="new_quantity" value="' + portfolio[symbol] + '"><button class="symbol-update-q">update</button></form>';
    cell.innerHTML = html;
    document.querySelector('.symbol-update-q').addEventListener('click', function(e) {
       e.preventDefault();
       var new_quantity = document.querySelector('input[name=new_quantity]').value;
       portfolio[symbol] = new_quantity;
       cell.innerHTML = new_quantity;
       autoSave();
    });
}

function removeSymbol(symbol) {
    portfolio[symbol] = 0;
    autoSave();
}

function autoSave() {
    save('portfolio', portfolio);
    save('prices', prices);
}

function addSymbol(event) {
    event.preventDefault();
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

    updatePriceFor(symbol);
    autoSave();

    renderFolio(portfolio, prices);

    // var snackbarContainer = document.querySelector('#demo-snackbar-example');
    // snackbarContainer.MaterialSnackbar.showSnackbar(symbol + " added to your portfolio");
}

function addActionHandlers() {}
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('symbol-edit')) {
            editSymbol(e.target.dataset.symbol);
        }
        if (e.target.classList.contains('symbol-remove')) {
            removeSymbol(e.target.dataset.symbol);
        }
    }, { passive: true, capture: true });
}

function init() {
    if (test() === true) {
        if (load('portfolio') !== null) {
            portfolio = load('portfolio');
        }

        if (load('prices') !== null) {
            prices = load('prices');
        }

        document.querySelector('.symbol-add').addEventListener('click', function(e) {
            addSymbol(e);
        });

        updatePrices();
        addActionHandlers();
        renderFolio(portfolio, prices);
        setInterval(updatePrices, 30000);
        setInterval(autoSave, 10000);
        setInterval(function() { renderFolio(portfolio, prices) }, 35000);
    } else {
        alert('Service not available');
    }
}

init();

