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
