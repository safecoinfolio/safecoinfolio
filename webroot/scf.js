function test() {
    if (!localStorage) {
        return false;
    }

    return true;
}

var prices = {
    'btc': [1.0, 2589.0],
    'eth': [0.11, 284.79]
};

var portfolio = {
    'btc': 1.200001,
    'eth': 0.005
};

function save(key, jsonData) {
    localStorage.setItem(key, JSON.stringify(jsonData));
}

function load(key) {
    return JSON.parse(localStorage.getItem(key));
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
    }
}

init();

