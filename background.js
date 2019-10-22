// 右クリックメニュー追加
var ContextMenus = new function () {
    var items = {};
    var callbacks = {};

    this.setItems = function (aItems) {
        aItems.forEach(function (item) {
            callbacks[item.id] = item.onclick;
            item.onclick = null;
            items[item.id] = item;
        });
    };

    this.create = function () {
        Object.keys(items).forEach(
            function (key) {
                chrome.contextMenus.create(items[key]);
            }
        );
    };

    chrome.contextMenus.onClicked.addListener(function (info, tab) {
        callbacks[info.menuItemId](info, tab);
    });
};

ContextMenus.setItems([
    {
        title: "StockTab",
        contexts: ["page"],
        type: "normal",
        id: 'StockTab',
        onclick: StockTab()
    },
    {
        title: "StockAllTabs",
        contexts: ["page"],
        type: "normal",
        id: 'StockAllTabs',
        onclick: StockAllTabs()
    }
]);

chrome.runtime.onInstalled.addListener(ContextMenus.create);

//現在開いているタブをストック
function StockTab() {
    return function (info, tabs) {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            let stockTabs = [];
            chrome.storage.local.get(["stockTabs"], function (items) {
                stockTabs = items.stockTabs ? items.stockTabs : [];
                for (let i = 0; i < tabs.length; i++) {
                    //「新しいタブ」以外を対象とする
                    console.log(tabs[i].url);
                    if (tabs[i].url != "chrome://newtab/") {
                        console.log(tabs[i].url);
                        let flg = false;
                        for (let j = 0; j < stockTabs.length; j++) {
                            if (tabs[i].url === stockTabs[j].url) {
                                stockTabs[j].title = tabs[i].title;
                                flg = true;
                                break;
                            }
                        }
                        if (!flg) {
                            let stockTab = {
                                title: tabs[i].title,
                                url: tabs[i].url,
                                favIconUrl: tabs[i].favIconUrl
                            };
                            stockTabs.push(stockTab);
                        }
                        chrome.tabs.remove(Number(tabs[i].id))
                    }
                }
                chrome.storage.local.set({ stockTabs: stockTabs });
            });
        })
    }
};

//開いている全てのタブをストック
function StockAllTabs() {
    return function (info, tabs) {
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            let stockTabs = [];
            chrome.storage.local.get(["stockTabs"], function (items) {
                stockTabs = items.stockTabs ? items.stockTabs : [];
                chrome.tabs.create({ active: true });
                for (let i = 0; i < tabs.length; i++) {
                    //「新しいタブ」以外を対象とする
                    if (tabs[i].url != "chrome://newtab/") {
                        let flg = false;
                        for (let j = 0; j < stockTabs.length; j++) {
                            if (tabs[i].url === stockTabs[j].url) {
                                stockTabs[j].title = tabs[i].title;
                                flg = true;
                                break;
                            }
                        }
                        if (!flg) {
                            let stockTab = {
                                title: tabs[i].title,
                                url: tabs[i].url,
                                favIconUrl: tabs[i].favIconUrl
                            };
                            stockTabs.push(stockTab);
                        }
                        chrome.tabs.remove(Number(tabs[i].id))
                    }
                }
                chrome.storage.local.set({ stockTabs: stockTabs });
            });
        })
    }
};
