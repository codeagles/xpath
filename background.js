// 存储窗口ID
let windowId = null;

// 监听插件图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
    // 首先注入 content script
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        
        await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['floating.css']
        });
        
        // 然后发送消息
        chrome.tabs.sendMessage(tab.id, {
            action: 'toggleXPathAnalyzer'
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

// 监听窗口关闭事件
chrome.windows.onRemoved.addListener((removedWindowId) => {
    if (removedWindowId === windowId) {
        windowId = null;
    }
}); 