# safecoinfolio

Browser based cryptocurrency portfolio. All your portfolio data are encrypted 
and never leave the device.

<img src="https://raw.githubusercontent.com/safecoinfolio/safecoinfolio/master/webroot/static/images/scf_screen_1.png" style="max-width: 80%">

## Storage and encryption

Data that you input are stored in browsers' local storage. If a browser, for
some reason (like disabled JavaScript), does not offer the local storage API
this app will not initialize and will not work.

When you enter data about your coins and transactions, before they get safely
stored in your browser, they will get encrypted using the AES-256 algorithm.

Therefore, it is necessary to remember your password for the portfolio, in order
to be able to load and decrypt them the next time you load the page.

## Source code

All source code is in this git repository. The only part that is not included
here is the SSL certificate for the main [website](https://www.safecoinfolio.com).

## Community 💗

Pull requests, comments, forks, bug reports are all welcome. The community works
on the principle of free, and open-source software, as well as on the principle
of ethical and inclusive conduct. Get more info at support(at)safecoinfolio.com
