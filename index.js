var $add           = document.querySelector('#add');
var $del           = document.querySelector('#del');
var $goto          = document.querySelector('#goto');
var $feed          = document.querySelector('#feed');
var $title         = document.querySelector("#title");
var $desc          = document.querySelector("#description");
var $more          = document.querySelector('#more');
var $less          = document.querySelector('legend');
var $detail        = document.querySelector('fieldset');
var $customServer  = document.querySelector('#customServer');
var $customUrl     = document.querySelector('input[type=url]');
var more           = false;

function getServer () {
    return $customServer.checked ? $customUrl.value : browser.extension.getBackgroundPage().getDefaultServer();
}

function openMore () {
    $more.style.display = 'none';
    $detail.style.display = 'block';
    more = true;
    save();
}

$more.addEventListener('click', openMore, false);

function save () {
    chrome.storage.local.set({
        'prefs': {
            'feed': $feed.value,
            'customUrl': $customUrl.value,
            'customServer': $customServer.checked,
            'more': more
        }
    });
    browser.extension.getBackgroundPage().update($feed.value, getServer());
}
function load (data) {
    if (data && data.prefs) {
        $feed.value = data.prefs.feed || browser.extension.getBackgroundPage().DEFAULT_FEED;
        $customUrl.value = data.prefs.customUrl || "https://";
        $customServer.checked = data.prefs.customServer;
        (data.prefs.more) && openMore();
    }
}

$goto.addEventListener('click', () => {
    chrome.tabs.create({
        url: getServer() + '?name=' + encodeURIComponent($feed.value)
    });
    save();
    window.close();
}, false);

$add.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        var url = [ getServer(), "add",
            "?name=", encodeURIComponent($feed.value) ,
            "&title=", encodeURIComponent($title.value || "") ,
            "&description="+ encodeURIComponent($desc.value || "") ,
            "&url=", encodeURIComponent(tabs[0].url)
        ].join("");
        browser.extension.getBackgroundPage().send(url, getServer() + "?n=" + encodeURIComponent($feed.value))
        .then(() => {
            save();
            window.close();
        });
    });
}, false);

$del.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        var url = [ getServer(), "del",
            "?name=", encodeURIComponent($feed.value) ,
            "&url=", encodeURIComponent(tabs[0].url)
        ].join("");
        browser.extension.getBackgroundPage().send(url, getServer() + "?n=" + encodeURIComponent($feed.value))
        .then(() => {
            save();
            window.close();
        });
    });
}, false);

$customUrl.addEventListener('focus', () => {
    $customServer.checked = true;
}, false);

$less.addEventListener('click', () => {
    $more.style.display = 'block';
    $detail.style.display = 'none';
    more = false;
    save();
}, false);

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('prefs', load);
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        $title.value = tabs[0].title || "";
    });
    $feed.select();
});

