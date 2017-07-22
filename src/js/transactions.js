var TXNS = [];

function addTx(item) {TXNS.push(addTxId(item))}

function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[810]/g, ch =>
    (ch ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> ch / 4).toString(16)
  )
}

function addTxId(item) {
    if (typeof item.id !== "undefined") {
        return item;
    }

    item.id = uuid();
    return item;
}

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

    sorted.forEach(function(txn, index) {
        txn = addTxId(txn); // remove sept-2017                
        var node = document.createElement('tr');
        node.innerHTML = getTxnRowHtml(txn);
        node.classList.add('txn-detail');
        node.classList.add('txn-detail-' + txn.sym);
        node.classList.add('txn-id-' + txn.id);
        row.after(node);
    });

    var bt = row.querySelector('.txns-view');
    bt.classList.remove('txns-view');
    bt.classList.add('txns-hide');
    bt.innerHTML = 'Hide txns';
}
function getTxnRowHtml(txn) {
    var pl = txn.pl();
    var pl_class = pl >= 0 ? 'profit' : 'loss';
    return '<td>' + txn.date + '</td>\
            <td>' + round(txn.q) + '</td>\
            <td>' + round(txn.cost / txn.q) + '</td>\
            <td></td>\
            <td></td>\
            <td class="' + pl_class + '">' + round(pl) + '</td>\
            <td><a href="#" data-id="' + txn.id + '" class="txn-edit">Edit</a>, <a href="#" data-id="' + txn.id + '" class="txn-delete">Delete</a></td>';
}

function deleteTxn(id) {
   var idx = -1;
   TXNS.forEach(function(txn, index) {
       if (txn.id === id) {
           idx = index;
       }
   });

   if (idx >= 0) {
       TXNS.splice(idx, 1);
   }

   document.querySelector('.txn-id-' + id).remove();
   renderFolio(portfolio, prices);
   autoSave();
}

function editTxn(id) {
    var tr = document.querySelector('.txn-id-' + id);
    if (!tr) { return }
    var txn;
    TXNS.forEach(function(t) {
        if (t.id === id) {
            txn = t;
        }
    });
    if (!txn) { return }

    var html = '<td><input type="text" name="date" value="' + txn.date + '"></td>\
                <td><input type="text" name="q" value="' + txn.q + '"></td>\
                <td><input type="text" name="avg" value="' + (txn.cost / txn.q) + '"></td>\
                <td></td>\
                <td></td>\
                <td><input type="text" value="' + txn.pl() + '"></td>\
                <td><a href="#" class="txn-update">Save</a><a href="#" class="txn-edit-cancel">Cancel</a></td>';
   tr.innerHTML = html;

   tr.querySelector('.txn-edit-cancel').onclick = function() {
       tr.innerHTML = getTxnRowHtml(txn);
   }
   tr.querySelector('.txn-update').onclick = function() {
       txn.date = tr.querySelector('input[name=date]').value;
       txn.q = tr.querySelector('input[name=q]').value;
       txn.cost = tr.querySelector('input[name=avg]').value * txn.q;
       //txn.price = tr.querySelector('input[name=price]').value;
       //txn.total = tr.querySelector('input[name=total]').value;
       tr.innerHTML = getTxnRowHtml(txn);
       autoSave();
       renderFolio(portfolio, prices);
   }
}

function hideTxns(symbol) {
    var row = document.querySelector('.row_' + symbol);
 
    document.querySelectorAll('.txn-detail-' + symbol).forEach(function(node) {
        node.remove();
    });

    var bt = row.querySelector('.txns-hide');
    bt.classList.add('txns-view');
    bt.classList.remove('txns-hide');
    bt.innerHTML = 'Transactions';
}
