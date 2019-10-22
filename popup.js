chrome.storage.local.get(["stockTabs"], function (items) {
    var stockTabs = items.stockTabs ? items.stockTabs : [];
    addElement(stockTabs);
});

function addElement(stockTabs) {
    for (var i = 0; i < stockTabs.length; i++) {
        var container = document.createElement("div");
        container.className = "container";
        //URLをidに設定
        container.id = stockTabs[i].url;
        container.onclick = function () {
            //ストックから取り出す
            //選択したwebページを一覧から削除
            this.parentNode.removeChild(this);
            //ストック情報を削除しページを開く
            pickupStorageItem(this.id);
        }
        var favicon = document.createElement("img");
        favicon.className = "favicon";
        favicon.src = stockTabs[i].favIconUrl;
        var content = document.createElement("span");
        content.className = "content";
        content.innerHTML = stockTabs[i].title;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.onclick = function (e) {
            //選択したwebページを開く（ストックからは削除しない）
            e.stopPropagation();
            //対象ページのURL（クリックされたボタンの親containerのID）を取得
            var container = this.parentElement;
            var containerId = this.parentElement.id;
            deleteStorageItem(containerId);
            container.remove();
        }
        container.appendChild(favicon);
        container.appendChild(content);
        container.appendChild(btn);
        document.body.appendChild(container);
    }
}

// Promiseを返すようラップして定義
async function getStockTabs() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["stockTabs"], result => {
            resolve(result);
        });
    });
}

async function deleteStorageItem(stockUrl) {
    let items = await getStockTabs();
    var stockTabs = items.stockTabs;
    for (var i = 0; i < stockTabs.length; i++) {
        if (stockTabs[i].url === stockUrl) {
            stockTabs.splice(i, 1);
            chrome.storage.local.set({ stockTabs: stockTabs });
            break;
        }
    }
}

async function pickupStorageItem(stockUrl) {
    await deleteStorageItem(stockUrl);
    //ページを開く
    window.open(stockUrl, '_blank');
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("searchbox").addEventListener("keyup", filterTabsList);
    function filterTabsList() {
        let contents = document.querySelectorAll(".content");
        contents.forEach(content => {
            if (content.innerHTML.toLowerCase().indexOf(this.value.toLowerCase()) < 0) {
                content.parentNode.style.display = "none";
            } else {
                content.parentNode.style.display = "grid";
            }
        })
    }
})