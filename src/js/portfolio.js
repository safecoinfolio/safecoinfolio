/**
 * sym = intrument symbol
 * date = transaction date
 * q = quantity
 * paid = amount paid
 * price = price per unit at the time of the transaction
 */
function PortfolioItem(sym, date, q, paid, price) {
  this.sym = sym;
  this.date = date;
  this.q = q;
  this.cost = q * paid;
  this.price = price;
  this.total = q * price;
}

PortfolioItem.prototype = {};

PortfolioItem.prototype.isSale = function() {
  return this.q >= 0 ? false : true;
}

PortfolioItem.prototype.isPurchase = function() {
  return this.q >= 0 ? true : false;
}

PortfolioItem.prototype.pl = function() {
  return this.isPurchase() ? this.total - this.cost : -1 * (this.total - this.cost);
}

function getPortfolio(instruments, prices) {
  var highestTotalDesc = [];
  for (var sym in instruments) {
    var price = typeof prices[sym] !== "undefined" ? prices[sym][1] : -1;
    var item = new PortfolioItem(sym, Math.floor(new Date()/1000), instruments[sym], 0, price);
    highestTotalDesc.push(item);
  }
  highestTotalDesc.sort(function(a, b) {
    return b.total - a.total;
  });

  return highestTotalDesc;
}

function getAggregateFolio(txns, prices) {
   var descAggregates = [];

   var aggregates = {};

   for (var tx in txns) {
       var txn = txns[tx];
       if (aggregates[txn.sym]) {
           var a = aggregates[txn.sym];
           a.q = parseFloat(a.q) + parseFloat(txn.q);
           var mktPrice = prices[txn.sym] && prices[txn.sym].length > 1 ? prices[txn.sym][1] : 0;
           a.total = a.q * mktPrice;
           a.cost = parseFloat(a.cost) + parseFloat(txn.cost);
           a.avg = a.cost / a.q;
           a.pl = a.total - a.cost;
       } else {
           var mktPrice = prices[txn.sym] && prices[txn.sym].length > 1 ? prices[txn.sym][1] : 0;
           aggregates[txn.sym] = {
               'sym': txn.sym,
               'avg': txn.cost / txn.q,
               'q': txn.q,
               'mktPrice': mktPrice,
               'total': txn.q * mktPrice,
               'pl': (txn.q * mktPrice) - txn.cost,
               'cost': txn.cost
           };
       }
   }

   for (var agg in aggregates) {
       descAggregates.push(aggregates[agg]);
   }

   descAggregates.sort(function(a, b) {
       return b.total - a.total;
   });

   return descAggregates;
}

function addSymbol(event) {
    event.preventDefault();
    var isBuy = document.querySelector('.tx_selector.active').classList.contains('tx_buy');
    var form = document.querySelector('.add-symbol-form');
    var symbol = form.querySelector('input[name=symbol]').value.toLowerCase();
    var quantity = Math.abs(parseFloat(form.querySelector('input[name=q]').value));
    var date = form.querySelector('input[name=date]').value;
    var price = parseFloat(form.querySelector('input[name=p]').value);

    if (!isBuy) {
        // selling from a bag of coins,
        // the cost is the average price for that coins
        var agg = getAggregateFolio(TXNS, prices);
        agg.forEach(function(c) {
            if (c.sym === symbol) {
                price = c.avg;
            }
        });

        quantity = -1 * quantity;
    }

    // fetch price and add transaction
    updatePriceFor(symbol, function(data) {
        var mktPrice = parseFloat(data.price_usd);
        var tx = new PortfolioItem(symbol, date, quantity, price, mktPrice);
        addTx(tx);
        renderFolio(prices);
    });

    updatePriceFor(symbol);
    autoSave();

    renderFolio(prices);

    // var snackbarContainer = document.querySelector('#demo-snackbar-example');
    // snackbarContainer.MaterialSnackbar.showSnackbar(symbol + " added to your portfolio");
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
       //portfolio[symbol] = new_quantity;
       cell.innerHTML = new_quantity;
        autoSave();
        renderFolio(prices);
    });
}

function removeSymbol(symbol) {
    portfolio[symbol] = 0;
    delete portfolio[symbol];
    autoSave();
    renderFolio(prices);
}

function renderFolio(prices) {
    var html = '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">\
        <thead>\
        <tr>\
        <th class="mdl-data-table__cell--non-numeric">Coin</th>\
        <th>Quantity</th>\
        <th>Avg. price (USD)</th>\
        <th>Market price (USD)</th>\
        <th>Total value (USD)</th>\
        <th>P/L (USD)</th>\
        <th>Action</th>\
    </tr>\
    </thead>\
    <tbody>';

    var oFolio = getAggregateFolio(TXNS, prices);

    for (var k in oFolio) {
        var item = oFolio[k];

        if (item.q === 0) {
            continue;
        }

        var kPriceDollar = item.mktPrice > 0 ? item.mktPrice : 'fetching price...';

        if (item.price === -1) {
            updatePriceFor(item.sym, function(){ renderFolio(prices)});
        }

        if (item.sym in MAPPING === false) {
            kPriceDollar = 'n/a';
        }

        var avgPrice = 0;
        var pl = 0;
        var pl_class = item.pl >= 0 ? 'profit' : 'loss';

        html += '<tr class="row_' + item.sym + '">\
            <td class="mdl-data-table__cell--non-numeric">' + item.sym.toUpperCase() + '</td>\
            <td class="' + item.sym + '_quantity">' + round(item.q) + '</td>\
            <td>' + round(item.avg) + '</td>\
            <td>' + round(kPriceDollar) + '</td>\
            <td>' + round(item.total) + '</td>\
            <td class="' + pl_class + '">' + round(item.pl) + '</td>\
            <td> <!-- <button data-symbol="' + item.sym + '" class="mdl-button mdl-js-button mdl-button--colored mdl-button--raised symbol-edit">Edit</button> <button data-symbol="' + item.sym + '" class="mdl-button mdl-js-button mdl-button--colored mdl-button--raised symbol-remove">Remove</button> --> <button data-symbol="' + item.sym + '" class="mdl-button mdl-js-button mdl-button--colored mdl-button--raised txns-view">Transactions</button></td>\
        </tr>';
    }

    if (oFolio.length === 0) {
        html += '<tr><td colspan="7" class="table_msg">Portfolio is empty</td></tr>';
    }

    html += '</tbody></table>';

    var table = document.querySelector('.portfolio_table')
    if (table) table.innerHTML = html;

    updateTotal(prices);
}

/**
 * @return an array of 3 elements:
 *             1) total USD value of the portfolio
               2) running PL
               3) realised PL
 */
function getTotals() {
    var total = 0;
    var running_pl = 0;
    var realised_pl = 0;

    TXNS.forEach(function(t) {
        if (prices[t.sym] && prices[t.sym].length > 1) {
            total += t.q * prices[t.sym][1];
            if (t.q > 0) running_pl += (t.q * prices[t.sym][1]) - t.cost;
            if (t.q < 0) realised_pl += (t.pl());
        }
    });

    return [total, running_pl, realised_pl];
}

function updateTotal(prices) {
    var total = 0;
    var total_pl = 0;

    TXNS.forEach(function(t) {
        if (prices[t.sym] && prices[t.sym].length > 1) {
            total += t.q * prices[t.sym][1];
            total_pl += (t.q * prices[t.sym][1]) - t.cost;
        }
    });

    var pl_class = total_pl >= 0 ? 'profit' : 'loss';

    var total_usd_el = document.querySelector('.total_usd');
    if (total_usd_el) total_usd_el.innerHTML = round(total);
    var total_pl_el = document.querySelector('.total_pl');
    if (total_pl_el) {
       total_pl_el.innerHTML = round(total_pl);
       total_pl_el.classList.remove('profit');
       total_pl_el.classList.remove('loss');
       total_pl_el.classList.add(pl_class);
    }
}
