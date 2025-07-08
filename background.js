// 存储窗口ID
let windowId = null;

// 添加标签页状态跟踪
const tabStates = {};

// 监听插件图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
    // 检查content.js是否已注入
    try {
        // 先尝试发送ping消息
        await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tab.id, {action: 'ping'}, (response) => {
                if (chrome.runtime.lastError || !response) {
                    reject();
                } else {
                    resolve();
                }
            });
        });
    } catch {
        // 未注入则注入脚本和样式
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['floating.css']
        });
        tabStates[tab.id] = true;
    }

    // 确保脚本加载完成后发送消息
    // 发送显示窗口消息并处理错误
    chrome.tabs.sendMessage(tab.id, { action: 'toggleXPathAnalyzer' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('发送消息失败:', chrome.runtime.lastError);
            // 失败时尝试重新注入脚本
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }).then(() => {
                chrome.tabs.sendMessage(tab.id, { action: 'toggleXPathAnalyzer' });
            });
        }
    });
});

// 添加窗口关闭消息处理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'windowClosed' && sender.tab) {
        tabStates[sender.tab.id] = false;
        sendResponse({ success: true });
    }
});

// 监听窗口关闭事件
chrome.windows.onRemoved.addListener((removedWindowId) => {
    if (removedWindowId === windowId) {
        windowId = null;
    }
});