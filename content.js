// 创建悬浮窗口函数
function createFloatingWindow() {
    const container = document.createElement('div');
    container.id = 'xpath-analyzer-container';
    
    container.innerHTML = `
        <div class="xpath-header">
            <h4>XPATH Parser</h4>
            <button class="close-button">×</button>
        </div>
        <div class="xpath-content">
            <div class="xpath-input-section">
                <textarea id="xpath-input" placeholder="请输入XPATH表达式..."></textarea>
                <div class="button-group">
                    <button id="clear-btn">清空</button>
                    <button id="parse-btn">解析</button>
                </div>
            </div>
            <div class="xpath-result-section">
                <div class="result-header">
                    <span>Result (0 rows)</span>
                    <button class="copy-button">复制结果</button>
                    <span class="copy-success">复制成功!</span>
                </div>
                <div id="result-container"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(container);
    
    // 设置初始位置在窗口中央
    const initialLeft = (window.innerWidth - container.offsetWidth) / 2;
    const initialTop = 100;
    container.style.left = `${initialLeft}px`;
    container.style.top = `${initialTop}px`;
    
    // 添加拖动功能
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = initialLeft;
    let yOffset = initialTop;

    const header = container.querySelector('.xpath-header');
    
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target.closest('.xpath-header')) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
            container.classList.add('dragging');
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            const maxX = window.innerWidth - container.offsetWidth;
            const maxY = window.innerHeight - container.offsetHeight;

            if (currentX < 0) currentX = 0;
            if (currentX > maxX) currentX = maxX;
            if (currentY < 0) currentY = 0;
            if (currentY > maxY) currentY = maxY;

            setTranslate(currentX, currentY);
        }
    }

    function dragEnd() {
        if (isDragging) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            container.classList.remove('dragging');
        }
    }

    function setTranslate(xPos, yPos) {
        container.style.left = `${xPos}px`;
        container.style.top = `${yPos}px`;
    }

    // 绑定其他事件处理
    const closeBtn = container.querySelector('.close-button');
    const clearBtn = container.querySelector('#clear-btn');
    const parseBtn = container.querySelector('#parse-btn');
    const xpathInput = container.querySelector('#xpath-input');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            container.classList.remove('visible');
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            xpathInput.value = '';
            document.querySelector('#result-container').innerHTML = '';
            const resultCount = document.querySelector('.result-header span:first-child');
            if (resultCount) {
                resultCount.textContent = 'Result (0 rows)';
            }
        });
    }

    if (parseBtn) {
        parseBtn.addEventListener('click', () => {
            const xpath = xpathInput.value;
            if (xpath.trim()) {
                evaluateXPath(xpath, document.querySelector('#result-container'));
            }
        });
    }

    // 添加复制按钮事件处理
    const copyBtn = container.querySelector('.copy-button');
    const copySuccess = container.querySelector('.copy-success');
    
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const resultText = Array.from(
                document.querySelectorAll('#result-container p')
            )
            .map(p => p.textContent)
            .join('\n');
            
            if (resultText) {
                navigator.clipboard.writeText(resultText)
                    .then(() => {
                        copySuccess.style.display = 'inline';
                        setTimeout(() => {
                            copySuccess.style.display = 'none';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('复制失败:', err);
                    });
            }
        });
    }
    
    return container;
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
        // 错误时也要更新结果数量
        const resultHeader = document.querySelector('.result-header');
        resultHeader.textContent = 'Result (0 rows)';
    }
}

// 修改显示结果函数
function displayResult(result, container) {
    container.innerHTML = '';
    
    // 更新结果数量
    const rowCount = result.snapshotLength;
    const resultCount = document.querySelector('.result-header span:first-child');
    if (resultCount) {
        resultCount.textContent = `Result (${rowCount} rows)`;
    }
    
    if (rowCount === 0) {
        container.innerHTML = '<p>未找到匹配结果</p>';
        return;
    }
    
    for (let i = 0; i < rowCount; i++) {
        const node = result.snapshotItem(i);
        const text = document.createElement('p');
        text.style.color = 'var(--text-white)';
        text.textContent = node.textContent.trim() || '';
        container.appendChild(text);
    }
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

// 添加消息监听器
let isInitialized = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleXPathAnalyzer') {
        // 确保只初始化一次
        if (!isInitialized) {
            createFloatingWindow();
            isInitialized = true;
        }
        
        // 获取容器
        const container = document.getElementById('xpath-analyzer-container');
        if (container) {
            // 使用requestAnimationFrame确保DOM更新
            requestAnimationFrame(() => {
                container.classList.toggle('visible');
                sendResponse({ success: true });
            });
        } else {
            sendResponse({ success: false });
        }
        return true;
    }
    return false;
});
