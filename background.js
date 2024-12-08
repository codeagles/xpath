// 存储窗口ID
let windowId = null;

// 监听插件图标点击事件
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {
        action: 'toggleXPathAnalyzer'
    });
});

// 监听窗口关闭事件
chrome.windows.onRemoved.addListener((removedWindowId) => {
    if (removedWindowId === windowId) {
        windowId = null;
    }
}); 