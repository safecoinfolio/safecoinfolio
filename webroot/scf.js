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
    'btc': 1
};;

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
        </tr>';
    }

    html += '</tbody></table>';

    document.querySelector('.portfolio_table').innerHTML = html;
}

function init() {
    if (test() === true) {
        renderFolio(portfolio, prices);
    }
}

init();

