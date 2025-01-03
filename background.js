// 存储窗口ID
let windowId = null;

// 监听插件图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // 并行注入脚本和样式
        await Promise.all([
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }),
            chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ['floating.css']
            })
        ]);
        
        // 确保注入完成后再发送消息
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 发送消息并等待响应
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'toggleXPathAnalyzer'
        });
        
        if (!response?.success) {
            throw new Error('Failed to toggle XPath analyzer');
        }
    } catch (error) {
        console.error('Error:', error);
        // 如果失败，重新尝试一次
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'toggleXPathAnalyzer'
            });
        } catch (retryError) {
            console.error('Retry failed:', retryError);
        }
    }
});

// 监听窗口关闭事件
chrome.windows.onRemoved.addListener((removedWindowId) => {
    if (removedWindowId === windowId) {
        windowId = null;
    }
});
