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
  return this.total - this.cost;
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
           var newAvg = ((a.q * a.avg) + (txn.cost)) / (a.q + txn.q);
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
