var TXNS = [];

function addTx(item) {TXNS.push(item)}

function showTxns(symbol) {
    var row = document.querySelector('.row_' + symbol);
    var html = '';

    var sorted = [];

    for (var tx in TXNS) {
        var txn = TXNS[tx];
        if (txn.sym === symbol) {
            sorted.push(txn);
        }
    }

    sorted.sort(function(a, b) {
        return b.date - a.date;
    });

    sorted.forEach(function(txn) {
        html = '<td>' + txn.date + '</td>\
            <td>' + round(txn.q) + '</td>\
            <td>' + round(txn.cost / txn.q) + '</td>\
            <td>' + round(txn.price) + '</td>\
            <td>' + round(txn.total) + '</td>\
            <td>' + round(txn.pl()) + '</td>\
            <td>Edit, Delete</td>';
        var node = document.createElement('tr');
        node.innerHTML = html;
        node.classList.add('txn-detail');
        row.after(node);
    });

    var bt = row.querySelector('.txns-view');
    bt.classList.remove('txns-view');
    bt.classList.add('txns-hide');
    bt.innerHTML = 'Hide txns';
}

function hideTxns(symbol) {
    var row = document.querySelector('.row_' + symbol);
 
    document.querySelectorAll('.txn-detail').forEach(function(node) {
        node.remove();
    });

    var bt = row.querySelector('.txns-hide');
    bt.classList.add('txns-view');
    bt.classList.remove('txns-hide');
    bt.innerHTML = 'Transactions';
}
