function test() {
    if (typeof localStorage === "undefined") {
        return false;
    }

    if (typeof CryptoJS.AES === "undefined") {
        return false;
    }

    if (typeof Promise !== "function") {
        return false;
    }

    return true;
}

var verify = {'id': 'FOO_BAR_123'};

var USER_ID = 'minky';
var SECRET_KEY = 'foobar';

var prices = {
};

var portfolio = {
};

function updatePriceFor(symbol, callback) {
    var url = 'https://api.coinmarketcap.com/v1/ticker/';
    var url_id = MAPPING[symbol];
    if (url_id) {
        get(url + url_id + '/', function () {
            var response = JSON.parse(this.responseText);
            var data = response[0];
            prices[data.symbol.toLowerCase()] = [data.price_btc, data.price_usd];
            if (typeof callback === "function") {
                callback(data);
            }
            console.log(
                'updating price of ' + data.symbol.toLowerCase() + ' as '
                + data.price_usd + '$');
        });
    }
}

function updatePrices() {

    for (var symbol in portfolio) {
        updatePriceFor(symbol.toLowerCase());
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
    if (USER_ID === 'minky') {
        return;
    }

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

        var kPriceDollar = prices[k] && prices[k].length > 1 ? prices[k][1] : 'fetching price...';

        if (!prices[k]) {
            updatePriceFor(k, function(){ renderFolio(portfolio, prices)});
        }

        if (k in MAPPING === false) {
            kPriceDollar = 'n/a';
        }

        html += '<tr>\
            <td class="mdl-data-table__cell--non-numeric">' + k.toUpperCase() + '</td>\
            <td class="' + k + '_quantity">' + kQuantity + '</td>\
            <td>' + kPriceDollar + '</td>\
            <td>' + kQuantity * kPriceDollar + '</td>\
            <td><button data-symbol="' + k + '" class="mdl-button mdl-js-button mdl-button--colored mdl-button--raised symbol-edit">Edit</button> <button data-symbol="' + k + '" class="mdl-button mdl-js-button mdl-button--colored mdl-button--raised symbol-remove">Remove</button></td>\
        </tr>';
    }

    if (holdings.length === 0) {
        html += '<div class="table_msg">Portfolio is empty</div>';
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
        renderFolio(portfolio, prices);
    });
}

function removeSymbol(symbol) {
    portfolio[symbol] = 0;
    autoSave();
    renderFolio(portfolio, prices);
}

function autoSave() {
    save('portfolio', portfolio);
    save('prices', prices);
}

function checkPassword() {
    if (load('check') === verify) {
        return true;
    } else {
        return false;
    }
}

function addSymbol(event) {
    event.preventDefault();
    var form = document.querySelector('.add-symbol-form');
    var symbol = form.querySelector('input[name=symbol]').value.toLowerCase();
    var quantity = form.querySelector('input[name=q]').value;

    // check exists
    if (portfolio[symbol]) {
        var nq = parseFloat(portfolio[symbol]) + parseFloat(quantity);
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

var actionHandlersInited = false;

function addActionHandlers() {
    if (actionHandlersInited) {
        return;
    }

    var dialog = document.querySelector('dialog');

    function submitChangeUserForm() {
        USER_ID = document.querySelector('input[name=username]').value;
        SECRET_KEY = document.querySelector('input[name=password]').value;

        try {
            var o = load('verify');
            if (o !== null && o.id !== verify.id) {
                alert('wrong password');
                return;
            }
        } catch (e) {
            alert('wrong password');
            return;
        }

        init();
        save('verify', verify);
        dialog.close();
        dialog.querySelector('.mdl-button.close').hidden = false;
    }

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('symbol-edit')) {
            editSymbol(e.target.dataset.symbol);
        }
        if (e.target.classList.contains('symbol-remove')) {
            removeSymbol(e.target.dataset.symbol);
        }
        if (e.target.classList.contains('change-user')) {
            dialog.showModal();
        }
    }, { passive: true, capture: true });

    document.querySelector('.symbol-add').addEventListener('click', function(e) {
        addSymbol(e);
    });

    dialog.querySelector('.close').addEventListener('click', function() {
        dialog.close();
    });
    dialog.querySelector('.do-change').addEventListener('click', function() {
        submitChangeUserForm();
    });

    dialog.addEventListener('keydown', function(e) {
        if (e.which === 13 || e.keyCode === 13) {
            submitChangeUserForm();
        }
    });

    actionHandlersInited = true;
}

var clockInited = false;

function setClock() {
    if (clockInited) {
        return;
    }

    setInterval(updatePrices, 300000);
    setInterval(autoSave, 10000);
    setInterval(function() { renderFolio(portfolio, prices) }, 35000);
    clockInited = true;
}

function init() {
    if (test() === true) {
        var dialog = document.querySelector('dialog');
        if (! dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
        }

        if (load('portfolio') !== null) {
            portfolio = load('portfolio');
        } else {
            portfolio = {};
        }

        if (load('prices') !== null) {
            prices = load('prices');
        }

        updatePrices();
        addActionHandlers();
        renderFolio(portfolio, prices);
        setClock();

        if (USER_ID === 'minky') {
            dialog.querySelector('.mdl-button.close').hidden = true;
            dialog.showModal();
            return;
        }
    } else {
        alert('Service not available');
    }
}

init();