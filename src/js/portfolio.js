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
  this.price = price;
  this.total = q * price;
}

PortfolioItem.prototype.isSale = function() {
  return q >= 0 ? false : true;
}

PortfolioItem.prototype.isPurchase = function() {
  return q >= 0 ? true : false;
}

function getPortfolio(instruments, prices) {
  var highestTotalDesc = [];
  for (var sym in instruments) {
    var item = new PortfolioItem(sym, Math.floor(new Date()/1000), instruments[sym], 0, prices[sym]);
    highestTotalDesc.push(item);
  }
  highestTotalDesc.sort(function(a, b) {
    return b.total - a.total;
  });

  return highestTotalDesc;
}
