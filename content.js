// 创建悬浮窗口
function createFloatingWindow() {
    const container = document.createElement('div');
    container.id = 'xpath-analyzer-container';
    
    container.innerHTML = `
        <div class="xpath-header">
            <h3>XPATH 解析器</h3>
            <button class="close-button">×</button>
        </div>
        <div class="xpath-content">
            <div class="xpath-input-section">
                <label for="xpath-input">XPATH 表达式</label>
                <textarea id="xpath-input" placeholder="请输入 XPATH 表达式..."></textarea>
                <button id="parse-btn">解析</button>
            </div>
            <div class="xpath-result-section">
                <h3>解析结果</h3>
                <div id="result-container"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(container);
    
    // 添加事件监听
    const closeBtn = container.querySelector('.close-button');
    const parseBtn = container.querySelector('#parse-btn');
    const xpathInput = container.querySelector('#xpath-input');
    const resultContainer = container.querySelector('#result-container');
    
    closeBtn.addEventListener('click', () => {
        container.classList.remove('visible');
    });
    
    parseBtn.addEventListener('click', () => {
        const xpath = xpathInput.value;
        evaluateXPath(xpath, resultContainer);
    });
}

// XPATH 解析函数
function evaluateXPath(xpath, resultContainer) {
    try {
        const processedXpath = xpath.replace(/\[\*\]/g, '[position()]');
        const result = document.evaluate(
            processedXpath,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        
        displayResult(result, resultContainer);
    } catch (e) {
        resultContainer.innerHTML = `<p class="error">错误：${e.message}</p>`;
    }
}

// 显示结果函数
function displayResult(result, container) {
    container.innerHTML = '';
    
    if (result.snapshotLength === 0) {
        container.innerHTML = '<p>未找到匹配结果</p>';
        return;
    }
    
    const ul = document.createElement('ul');
    for (let i = 0; i < result.snapshotLength; i++) {
        const node = result.snapshotItem(i);
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="result-item">
                <div class="result-text">${node.textContent.trim() || '空文本'}</div>
                <div class="result-xpath">${getFullXPath(node)}</div>
            </div>
        `;
        ul.appendChild(li);
    }
    
    container.appendChild(ul);
}

// 获取完整 XPath 路径
function getFullXPath(node) {
    if (node.nodeType !== 1) return '';
    
    if (node.hasAttribute('id')) {
        return `//*[@id="${node.id}"]`;
    }
    
    const sameTagSiblings = Array.from(node.parentNode.children)
        .filter(child => child.tagName === node.tagName);
    
    const idx = sameTagSiblings.indexOf(node) + 1;
    const path = getFullXPath(node.parentNode);
    
    return path ? `${path}/${node.tagName.toLowerCase()}[${idx}]` : `/${node.tagName.toLowerCase()}[${idx}]`;
}

// 初始化
createFloatingWindow();

// 监听扩展图标点击
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleXPathAnalyzer') {
        const container = document.getElementById('xpath-analyzer-container');
        container.classList.toggle('visible');
    }
});