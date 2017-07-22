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
   renderFolio(prices);
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
       renderFolio(prices);
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

function round(num) {
    return Math.floor(num * 100) / 100;
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

function checkPassword() {
    if (load('check') === verify) {
        return true;
    } else {
        return false;
    }
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
            return editSymbol(e.target.dataset.symbol);
        }
        if (e.target.classList.contains('symbol-remove')) {
            return removeSymbol(e.target.dataset.symbol);
        }
        if (e.target.classList.contains('change-user')) {
            return dialog.showModal();
        }
        if (e.target.classList.contains('txns-view')) {
            return showTxns(e.target.dataset.symbol);
        }
        if (e.target.classList.contains('txns-hide')) {
            return hideTxns(e.target.dataset.symbol);
        }
        if (e.target.classList.contains('txn-edit')) {
            return editTxn(e.target.dataset.id);
        }
        if (e.target.classList.contains('txn-delete')) {
            return deleteTxn(e.target.dataset.id);
        }

    }, { passive: true, capture: true });

    var addBt = document.querySelector('.symbol-add');
    if (addBt) {
        addBt.addEventListener('click', function(e) {
            addSymbol(e);
        });
    }

    if (dialog) {
	var closeBt = dialog.querySelector('.close');
	if (closeBt) {
            closeBt.addEventListener('click', function() {
		dialog.close();
            });
	}

	var doChangeBt = dialog.querySelector('.do-change');
	if (doChangeBt) {
            doChangeBt.addEventListener('click', function() {
		submitChangeUserForm();
            });
	}


	dialog.addEventListener('keydown', function(e) {
            if (e.which === 13 || e.keyCode === 13) {
		submitChangeUserForm();
            }
	});
    }

    actionHandlersInited = true;
}

var clockInited = false;

function setClock() {
    if (clockInited) {
        return;
    }

    setInterval(updatePrices, 300000);
    setInterval(autoSave, 10000);
    //setInterval(function() { renderFolio(portfolio, prices) }, 120000);
    clockInited = true;
}

// migrates the tx-less portfolio to a tx based portfolio
function migrate() {
    if (TXNS.length === 0 && getPortfolio(portfolio, prices).length > 0) {
        console.log('migrating');
        for (var s in portfolio) {
            // add as tx
            var p = prices[s] && prices[s].length > 1 ? prices[s][1] : 0;
            var t = new PortfolioItem(s, new Date()/1000, portfolio[s], p, p);
            addTx(t);
        }
    }
    portfolio = {};
    autoSave();
}

function init() {
    if (test() === true) {
        var dialog = document.querySelector('dialog');
        if (dialog && !dialog.showModal) {
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

        if (load('txns') !== null) {
            TXNS = load('txns');
            TXNS = TXNS.map(function(tx) { return Object.assign(new PortfolioItem, tx)});
        } else {
            TXNS = [];
        }

        migrate();

        var inputDate = document.querySelector('input[name=date]');
        if (inputDate) inputDate.valueAsDate = new Date();

        updatePrices();
        addActionHandlers();
        renderFolio(prices);
        setClock();

        if (USER_ID === 'minky') {
            if (!dialog) return;
            var closeBt = dialog.querySelector('.mdl-button.close');
            if (closeBt) closeBt.hidden = true;
            dialog.showModal();
            return;
        }
    } else {
        alert('Service not available');
    }
}

init();
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

function addSymbol(event) {
    event.preventDefault();
    var form = document.querySelector('.add-symbol-form');
    var symbol = form.querySelector('input[name=symbol]').value.toLowerCase();
    var quantity = form.querySelector('input[name=q]').value;
    var date = form.querySelector('input[name=date]').value;
    var price = form.querySelector('input[name=p]').value;

    // fetch price and add transaction
    updatePriceFor(symbol, function(data) {
        var mktPrice = data.price_usd;
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
var MAPPING = {"42":"42-coin","611":"sixeleven","808":"808coin","888":"octocoin","1337":"1337","btc":"bitcoin","eth":"ethereum","xrp":"ripple","ltc":"litecoin","etc":"ethereum-classic","dash":"dash","xem":"nem","miota":"iota","strat":"stratis","xmr":"monero","eos":"eos","veri":"veritaseum","bcc":"bitconnect","bts":"bitshares","qtum":"qtum","zec":"zcash","ans":"antshares","steem":"steem","waves":"waves","usdt":"tether","icn":"iconomi","bcn":"bytecoin-bcn","sc":"siacoin","gnt":"golem-network-tokens","gno":"gnosis-gno","rep":"augur","doge":"dogecoin","lsk":"lisk","xlm":"stellar","gbyte":"byteball","fct":"factom","maid":"maidsafecoin","dcr":"decred","snt":"status","game":"gamecredits","ardr":"ardor","kmd":"komodo","nxt":"nxt","dgd":"digixdao","pivx":"pivx","bdl":"bitdeal","mcap":"mcap","dgb":"digibyte","bat":"batcoin","ppt":"populous","1st":"firstblood","bnt":"bancor","omg":"omisego","pay":"tenx","mtl":"metal","btcd":"bitcoindark","sngls":"singulardtv","ant":"aragon","sys":"syscoin","mgo":"mobilego","lkk":"lykke","cvc":"civic","ark":"ark","dct":"decent","coe":"coeval","ppc":"peercoin","nmr":"numeraire","emc":"emercoin","leo":"leocoin","fun":"funfair","part":"particl","ubq":"ubiq","edg":"edgeless","nxs":"nexus","xvg":"verge","xas":"asch","round":"round","wings":"wings","rdd":"reddcoin","lbc":"library-credit","rlc":"rlc","storj":"storj","ppy":"peerplays-ppy","nmc":"namecoin","mln":"melon","xaur":"xaurum","dice":"etheroll","nlg":"gulden","cloak":"cloakcoin","block":"blocknet","mona":"monacoin","via":"viacoin","bay":"bitbay","hmq":"humaniq","xcp":"counterparty","qrl":"quantum-resistant-ledger","vsl":"vslice","blk":"blackcoin","fair":"faircoin","unity":"supernet-unity","sib":"sibcoin","edr":"e-dinar-coin","amp":"synereo","sky":"skycoin","pot":"potcoin","vtc":"vertcoin","qau":"quantum","xzc":"zcoin","omni":"omni","soar":"soarcoin","ybc":"ybcoin","adt":"adtoken","xrl":"rialto","burst":"burst","xel":"elastic","tkn":"tokencard","nav":"nav-coin","eac":"earthcoin","golos":"golos","obits":"obits","ioc":"iocoin","taas":"taas","trst":"trust","xdn":"digitalnote","ecob":"ecobit","grc":"gridcoin","frst":"firstcoin","crw":"crown","rads":"radium","moon":"mooncoin","exp":"expanse","plbt":"polybius","myst":"mysterium","uny":"unity-ingot","nvc":"novacoin","dtb":"databits","grs":"groestlcoin","chc":"chaincoin","agrs":"agoras-tokens","snm":"sonm","ecn":"e-coin","sls":"salus","safex":"safe-exchange-coin","vox":"voxels","nxc":"nexium","neos":"neoscoin","cfi":"cofound-it","enrg":"energycoin","mue":"monetaryunit","wct":"waves-community-token","ion":"ion","plu":"pluton","ptoy":"patientory","san":"santiment","b@":"bankcoin","time":"chronobank","bcap":"bcap","shift":"shift","qrk":"quark","eb3":"eb3-coin","spr":"spreadcoin","bash":"luckchain","gup":"guppy","heat":"heat-ledger","mec":"megacoin","wdc":"worldcoin","ifc":"infinitecoin","bcy":"bitcrystals","clam":"clams","rby":"rubycoin","dbix":"dubaicoin-dbix","mco":"monaco","uno":"unobtanium","swt":"swarm-city","nvst":"nvo","mgc":"gulfcoin","xpm":"primecoin","pepecash":"pepe-cash","ftc":"feathercoin","dgc":"digitalcoin","lmc":"lomocoin","bitcny":"bitcny","note":"dnotes","fldc":"foldingcoin","xby":"xtrabytes","rise":"rise","xbc":"bitcoin-plus","daxx":"daxxcoin","vrc":"vericoin","net":"netcoin","ett":"encryptotel","xcn":"cryptonite","flo":"florincoin","vash":"vpncoin","gam":"gambit","aeon":"aeon","muse":"bitshares-music","nlc2":"nolimitcoin","dmd":"diamond","zen":"zencash","bela":"belacoin","esp":"espers","incnt":"incent","pasc":"pascal-coin","emc2":"einsteinium","max":"maxcoin","ok":"okcash","sphr":"sphere","lun":"lunyr","coval":"circuits-of-value","crb":"creditbit","bitb":"bitbean","slr":"solarcoin","adx":"adex","med":"mediterraneancoin","ric":"riecoin","aur":"auroracoin","zet":"zetacoin","music":"musicoin","blitz":"blitzcash","gcr":"global-currency-reserve","bsd":"bitsend","zcc":"zccoin","kobo":"kobocoin","bost":"boostcoin","pink":"pinkcoin","xvc":"vcash","emv":"ethereum-movie-venture","arc":"arcade-token","bqx":"bitquence","wgr":"wagerr","gld":"goldcoin","cadastral":"bitland","apx":"apx","src":"securecoin","dime":"dimecoin","seq":"sequence","anc":"antcoin","cure":"curecoin","aby":"applebyte","xrb":"raiblocks","tag":"tagcoin","sbd":"steem-dollars","put":"putincoin","xmy":"myriad","bitusd":"bitusd","synx":"syndicate","dyn":"dynamic","ecc":"eccoin","dar":"darcrus","atms":"atmos","skin":"skincoin","naut":"nautiluscoin","dex":"instantdex","xst":"stealthcoin","zeni":"zennies","xbb":"boolberry","snrg":"synergy","wbb":"wild-beast-block","sta":"starta","zeit":"zeitcoin","bta":"bata","icoo":"ico-openledger","kore":"korecoin","pdc":"project-decorum","dot":"dotcoin","mint":"mintcoin","adc":"audiocoin","zcl":"zclassic","excl":"exclusivecoin","trig":"triggers","rlt":"roulettetoken","dope":"dopecoin","xspec":"spectrecoin","mne":"minereum","insn":"insanecoin-insn","qwark":"qwark","brx":"breakout-stake","crea":"creativecoin","icash":"icash","zrc":"zrcoin","btm":"bitmark","lgd":"legends-room","fst":"fastcoin","tx":"transfercoin","vrm":"veriumreserve","blockpay":"blockpay","nka":"incakoin","swift":"bitswift","crave":"crave","huc":"huntercoin","ntrn":"neutron","rns":"renos","2give":"2give","brk":"breakout","erc":"europecoin","cann":"cannabiscoin","posw":"posw-coin","adz":"adzcoin","thc":"hempcoin","hush":"hush","eqt":"equitrader","inpay":"inpay","ccrb":"cryptocarbon","adl":"adelphoi","fnc":"fincoin","ptc":"pesetacoin","vtr":"vtorrent","visio":"visio","trc":"terracoin","xwc":"whitecoin","geo":"geocoin","tips":"fedoracoin","tix":"tickets","pangea":"pangea-poker","xvp":"virtacoinplus","htc":"hitcoin","nsr":"nushares","netko":"netko","egc":"evergreencoin","start":"startcoin","pepe":"memetic","hyp":"hyperstake","trust":"trustplus","efl":"e-gulden","hkg":"hacker-gold","fuck":"fucktoken","ice":"idice","func":"funcoin","tks":"tokes","sxc":"sexcoin","ldoge":"litedoge","vsm":"voise","mer":"mercury","html5":"htmlcoin","ping":"cryptoping","fimk":"fimkrypto","cpc":"capricoin","alt":"altcoin-alt","rbx":"ripto-bux","otx":"octanox","pnd":"pandacoin-pnd","super":"supercoin","draco":"dt-token","glc":"globalcoin","xto":"tao","cbx":"cryptogenic-bullion","xtc":"tilecoin","el":"elcoin-el","xmg":"magi","proc":"procurrency","blu":"bluecoin","4chn":"chancoin","moin":"moin","sprts":"sprouts","xhi":"hicoin","pkb":"parkbyte","btsr":"btsr","log":"woodcoin","hero":"sovereign-hero","smly":"smileycoin","uis":"unitus","rain":"condensate","cnt":"centurion","mrt":"miners-reward-token","fjc":"fujicoin","wgo":"wavesgo","byc":"bytecent","btx":"bitcointx","cft":"cryptoforecast","krb":"karbowanec","cv2":"colossuscoin-v2","gcn":"gcoin","btb":"bitbar","bits":"bitstar","foot":"footy-cash","usnbt":"nubits","pak":"pakcoin","zer":"zero","infx":"influxcoin","iti":"iticoin","unify":"unify","dcy":"dinastycoin","trump":"trumpcoin","8bit":"8bit","post":"postcoin","emd":"emerald","yoc":"yocoin","dnr":"denarius-dnr","mzc":"mazacoin","hpc":"happycoin","frn":"francs","piggy":"piggycoin","nobl":"noblecoin","dem":"deutsche-emark","ufo":"ufo-coin","bun":"bunnycoin","xp":"xp","score":"scorecoin","dp":"digitalprice","gtc":"global-tour-coin","zoi":"zoin","putic":"putin-classic","sumo":"sumokoin","smc":"smartcoin","cnc":"chncoin","bern":"berncash","xvs":"vsync","aglc":"agrolifecoin","mnm":"mineum","vuc":"virta-unique-coin","c2":"coin2-1","tek":"tekcoin","bxt":"bittokens","cj":"cryptojacks","tit":"titcoin","mscn":"master-swiscoin","vidz":"purevidz","unb":"unbreakablecoin","bitbtc":"bitbtc","ent":"eternity","lana":"lanacoin","xjo":"joulecoin","bucks":"swagbucks","rbies":"rubies","newb":"newbium","asafe2":"allsafe","kurt":"kurrent","pie":"piecoin","mi":"xiaomicoin","gb":"goldblocks","tse":"tattoocoin","vrs":"veros","kayi":"kayi","linx":"linx","glt":"globaltoken","bitsilver":"bitsilver","prc":"prcoin","psb":"pesobit","xlr":"solaris","eco":"ecocoin","cxt":"coinonat","ttc":"tittiecoin","atom":"atomic-coin","boli":"bolivarcoin","bitgold":"bitgold","gcc":"guccionecoin","xra":"ratecoin","das":"das","gun":"guncoin","evo":"evotion","klc":"kilocoin","biteur":"biteur","gpu":"gpu-coin","rbt":"rimbit","dibc":"dibcoin","mojo":"mojocoin","gp":"goldpay-coin","ree":"reecoin","nro":"neuro","b3":"b3coin","ery":"eryllium","wyv":"wyvern","crx":"chronos","xco":"x-coin","uet":"useless-ethereum-token","honey":"honey","mnc":"mantracoin","knc":"kingn-coin","zmc":"zetamicron","hxx":"hexx","isl":"islacoin","$$$":"money","ams":"amsterdamcoin","frc":"freicoin","socc":"socialcoin-socc","lbtc":"litebitcoin","dix":"dix-asset","coal":"bitcoal","creva":"crevacoin","bnx":"bnrtxcoin","dollar":"dollar-online","flax":"flaxscript","mtlmc3":"metal-music-coin","wex":"wexcoin","benji":"benjirolls","lvps":"levoplus","argus":"argus","ebt":"ebittree-coin","boat":"doubloon","els":"elysium","geert":"geertcoin","onx":"onix","mgm":"magnum","rup":"rupee","dmb":"digital-money-bits","jinn":"jinn","bpc":"bitpark-coin","insane":"insanecoin","cno":"coin","xc":"xcurrency","jns":"janus","ac":"asiacoin","ixc":"ixcoin","carbon":"carboncoin","e4row":"ether-for-the-rest-of-the-world","nyc":"newyorkcoin","gre":"greencoin","bitz":"bitz","usc":"ultimate-secure-cash","yash":"yashcoin","sdc":"shadowcash","v":"version","cdn":"canada-ecoin","casino":"casino","rc":"russiacoin","fund":"cryptofund","hodl":"hodlcoin","orb":"orbitcoin","crypt":"cryptcoin","i0c":"i0coin","gaia":"gaia","dsh":"dashcoin","brit":"britcoin","troll":"trollcoin","tri":"triangles","tes":"teslacoin","fcn":"fantomcoin","dvc":"devcoin","fly":"flycoin","fc2":"fuelcoin","corg":"corgicoin","token":"swaptoken","hnc":"huncoin","talk":"btctalkcoin","pxc":"phoenixcoin","shorty":"shorty","good":"good-karma","cage":"cagecoin","funk":"the-cypherfunks","hbn":"hobonickels","metal":"metalcoin","utc":"ultracoin","kic":"kibicoin","rarepepep":"rare-pepe-party","amber":"ambercoin","pasl":"pascal-lite","dwc":"deepwebcash","q2c":"qubitcoin","xgr":"goldreserve","xct":"c-bit","ccn":"cannacoin","flt":"fluttercoin","ltb":"litebar","adcn":"asiadigicoin","mac":"machinecoin","ele":"elementrem","ari":"aricoin","au":"aurumcoin","sts":"stress","cap":"bottlecaps","units":"gameunits","chess":"chesscoin","btd":"bitcloud","bsty":"globalboost-y","mcrn":"macron","nyan":"nyancoin","unic":"unicoin","ohm":"ohm-wallet","trk":"truckcoin","kush":"kushcoin","tstr":"tristar-coin","blc":"blakecoin","vlt":"veltor","lot":"lottocoin","swing":"swing","duo":"parallelcoin","cat":"catcoin","pxi":"prime-xi","dbtc":"debitcoin","btcs":"bitcoin-scrypt","mxt":"martexcoin","xpy":"paycoin2","worm":"healthywormcoin","eca":"electra","unit":"universal-currency","tor":"torcoin-tor","slg":"sterlingcoin","cnnc":"cannation","btcr":"bitcurrency","ked":"darsek","cube":"digicube","mtm":"mtmgaming","xre":"revolvercoin","mars":"marscoin","euc":"eurocoin","xpd":"petrodollar","tgc":"tigercoin","qtl":"quatloo","pip":"pipcoin","space":"spacecoin","qcn":"quazarcoin","bigup":"bigup","jin":"jin-coin","hmp":"hempcoin-hmp","mar":"marijuanacoin","j":"joincoin","pr":"prototanium","phs":"philosopher-stones","red":"redcoin","yac":"yacoin","way":"wayguide","stv":"sativacoin","csc":"casinocoin","spt":"spots","hal":"halcyon","cpn":"compucoin","vc":"virtualcoin","val":"valorbit","dlc":"dollarcoin","bria":"briacoin","ims":"independent-money-system","icob":"icobid","con":"paycon","drs":"digital-rupees","arco":"aquariuscoin","btpl":"bitcoin-planet","spex":"sproutsextreme","zny":"bitzeny","cyp":"cypher","vec2":"vector","grt":"grantcoin","bumba":"bumbacoin","cach":"cachecoin","evil":"evil-coin","neva":"nevacoin","bob":"dobbscoin","pho":"photon","gap":"gapcoin","drm":"dreamcoin","all":"allion","bip":"bipcoin","vta":"virtacoin","acoin":"acoin","bqc":"bbqcoin","wmc":"wmcoin","atx":"artex-coin","frk":"franko","pop":"popularcoin","uniburst":"uniburst","taj":"tajcoin","blry":"billarycoin","xcre":"creatio","flvr":"flavorcoin","arg":"argentum","mad":"satoshimadness","uni":"universe","vltc":"vault-coin","rpc":"ronpaulcoin","jwl":"jewels","bvc":"beavercoin","soon":"sooncoin","px":"px","bcf":"bitcoinfast","mnd":"mindcoin","song":"songcoin","sh":"shilling","zur":"zurcoin","sling":"sling","fuzz":"fuzzballs","fire":"firecoin","u":"ucoin","urc":"unrealcoin","ponzi":"ponzicoin","sfc":"solarflarecoin","mst":"mustangcoin","arb":"arbit","luna":"luna-coin","chao":"23-skidoo","cmt":"comet","g3n":"genstake","gbc":"gbcgoldcoin","bstar":"blackstar","scrt":"secretcoin","cash":"cashcoin","vip":"vip-tokens","uro":"uro","meow":"kittehcoin","plnc":"plncoin","acp":"anarchistsprime","aum":"alexium","xbts":"beatcoin","zyd":"zayedcoin","anti":"antibitcoin","blz":"blazecoin","bios":"bios-crypto","xptx":"platinumbar","milo":"milocoin","warp":"warp","pulse":"pulse","off":"cthulhu-offerings","slevin":"slevin","des":"destiny","cesc":"cryptoescudo","may":"theresa-may-coin","imx":"impact","orly":"orlycoin","prx":"printerium","ride":"ride-my-car","cwxt":"cryptoworldx-token","lea":"leacoin","ammo":"ammo-rewards","ltcr":"litecred","cab":"cabbage","xbtc21":"bitcoin-21","icon":"iconic","420g":"ganjacoin","hvco":"high-voltage","gbt":"gamebet-coin","ocean":"burstocean","btq":"bitquark","cto":"crypto","vprc":"vaperscoin","scs":"speedcash","ego":"ego","xoc":"xonecoin","hiro":"hirocoin","steps":"steps","ltbc":"ltbcoin","jobs":"jobscoin","imps":"impulsecoin","bsc":"bowscoin","qbk":"qibuck-asset","os76":"osmiumcoin","dlisk":"dappster","1cr":"1credit","ccm100":"ccminer","zne":"zonecoin","dpay":"dpay","ibank":"ibank","impch":"impeachcoin","xrc":"rawcoin2","altc":"antilitecoin","tagr":"tagrcoin","rev":"revenu","crt":"crtcoin","volt":"bitvolt","conx":"concoin","sandg":"save-and-gain","lir":"letitride","abn":"abncoin","jio":"jio-token","lex":"lex4all","etb":"ethbits","pex":"posex","env":"environ","sdp":"sydpak","xng":"enigma","cf":"californium","nodc":"nodecoin","biob":"biobar","p7c":"p7coin","dragon":"btcdragon","fdc":"future-digital-currency","pizza":"pizzacoin","slfi":"selfiecoin","pwr":"powercoin","dgcs":"digital-credits","zhs":"zcashshare","mug":"mikethemug","xen":"xenixcoin","calc":"caliphcoin","gxs":"gxshares","hlb":"lepaoquan","ico":"ico","frgc":"fargocoin","dmc":"dynamiccoin","bitok":"bitok","sjcx":"storjcoin-x","etp":"metaverse","atcc":"atc-coin","gyc":"gycoin","fal":"falcoin","bgc":"bagcoin","deus":"deuscoin","axf":"axfunds","xid":"international-diamond","malc":"malcoin","voya":"voyacoin","dhg":"dhg","linda":"linda","ebst":"eboostcoin","club":"clubcoin","dtf":"digitalfund","ocn":"operacoin","rsgp":"rsgpcoin","edrc":"edrcoin","primu":"primulon","skull":"pirate-blocks","shell":"shellcoin","fxe":"futurexe","mg":"mind-gene","gbg":"golos-gold","pzm":"prizm","wa":"wa-space","kashh":"kashhcoin","bet":"betacoin","pcs":"pabyosi-coin-special","iop":"internet-of-people","tcoin":"t-coin","btu":"bitcoin-unlimited","emp":"emoneypower","guc":"goldunioncoin","tycho":"tychocoin","tera":"teracoin","skr":"sakuracoin","rubit":"rublebit","flash":"flash","lnk":"link-platform","women":"women","shnd":"stronghands","zbc":"zilbercoin","slm":"slimcoin","apc":"alpacoin","cvcoin":"cvcoin","opal":"opal","money":"moneycoin","feds":"fedorashare","pac":"paccoin","mbrs":"embers","gay":"gaycoin","xot":"internet-of-things","fazz":"fazzcoin","rbbt":"rabbitcoin","ur":"ur","don":"donationcoin","unc":"uncoin","qbt":"cubits","tell":"tellurion","trade2":"tradecoin-v2","unrc":"universalroyalcoin","pres":"president-trump","hcc":"happy-creator-coin","abc":"alphabitcoinfund","iflt":"inflationcoin","xde2":"xde-ii","marx":"marxcoin","gary":"president-johnson","irl":"irishcoin","poke":"pokecoin","ntcc":"neptune-classic","hill":"president-clinton","burn":"president-sanders","smart":"smartcash","ae":"aeternity","antx":"antimatter","turbo":"turbocoin","stex":"stex","best":"bestchain","zse":"zsecoin","btwty":"bit20","lepen":"lepen","tesla":"teslacoilcoin","moneta":"moneta2","cc":"cybercoin","xqn":"quotient","aib":"advanced-internet-blocks","ldcn":"landcoin","xlc":"leviarcoin","efyt":"ergo","nanox":"project-x","jet":"jetcoin","buk":"cryptobuck","moto":"motocoin","bro":"bitradio","qora":"qora","hallo":"halloween-coin","amis":"amis","sak":"sharkcoin","laz":"lazaruscoin","av":"avatarcoin","tyc":"tyrocoin","ffc":"fireflycoin","lkc":"linkedcoin","acn":"avoncoin","ths":"techshares","yog":"yogold","soul":"soulcoin","btg":"bitgem","bit":"first-bitcoin","royal":"royalcoin","gpl":"gold-pressed-latinum","xve":"the-vegan-initiative","omc":"omicron","zengold":"zengold","rhfc":"rhfcoin","pi":"picoin","bxc":"bitcedi","ter":"terranova","sha":"shacoin","tic":"true-investment-coin","sport":"sportscoin","ani":"animecoin","9coin":"9coin","topaz":"topaz","ocow":"ocow","yes":"yescoin","qbc":"quebecoin","mbl":"mobilecash","elc":"elacoin","skc":"skeincoin","blazr":"blazercoin","sfe":"safecoin","tp1":"kolschcoin","dashs":"dashs","iec":"ivugeocoin","gain":"ugain","payp":"paypeer","axiom":"axiom","wow":"wowcoin","egg":"eggcoin","miu":"miyucoin","vgc":"vegascoin","qrz":"quartz-qrz","prm":"prismchain","futc":"futcoin","rcn":"rcoin","brain":"braincoin","lth":"lathaan","coupe":"coupecoin","pdg":"pinkdog","x2":"x2","aces":"aces","gbrc":"global-business-revolution","disk":"darklisk","vty":"victoriouscoin","bac":"bitalphacoin","mmxvi":"mmxvi","tcr":"thecreed","pcn":"peepcoin","snc":"suncontract","wec":"wowecoin","cyc":"cycling-coin","ivz":"invisiblecoin","wsx":"wearesatoshi","strb":"superturbostake","op":"operand","gmx":"goldmaxcoin","team":"teamup","gml":"gameleaguecoin","frwc":"frankywillcoin","trick":"trickycoin","cme":"cashme","karma":"karmacoin","snake":"snakeeyes","bgr":"bongger","asc":"asiccoin","mrc":"microcoin","sync":"sync","nbe":"bitcentavo","xau":"xaucoin","dub":"dubstep","dcre":"deltacredits","dft":"draftcoin","opes":"opescoin","psy":"psilocybin","elco":"elcoin","clint":"clinton","richx":"richcoin","dbg":"digital-bullion-gold","today":"todaycoin","golf":"golfcoin","rycn":"royalcoin-2","cbd":"cbd-crystals","nbit":"netbit","troptions":"troptions","xstc":"safe-trade-coin","gmb":"gambleo","mavro":"mavro","tle":"tattoocoin-limited","xbg":"btcgold","warrant":"warrant","cheap":"cheapcoin","rmc":"remicoin"};
function get(url, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener("load", callback);
    req.open("GET", url);
    req.setRequestHeader('Accept', '*/*');
    req.send();
}
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

function autoSave() {
    //save('portfolio', portfolio);
    save('prices', prices);
    save('txns', TXNS);
}
