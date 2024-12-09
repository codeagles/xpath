let resultContainer; // 声明全局变量

document.addEventListener('DOMContentLoaded', function() {
    const xpathInput = document.getElementById('xpath-input');
    const parseBtn = document.getElementById('parse-btn');
    const closeBtn = document.getElementById('close-btn');
    const clearBtn = document.getElementById('clear-btn');
    resultContainer = document.getElementById('result-container'); // 初始化全局变量

    // 添加关闭按钮事件监听
    closeBtn.addEventListener('click', function() {
        window.close();
    });

    parseBtn.addEventListener('click', function() {
        // 获取当前活动标签页
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const xpath = xpathInput.value;
            
            // 向内容脚本发送消息
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'evaluateXPath',
                xpath: xpath
            }, response => {
                if (chrome.runtime.lastError) {
                    displayResult([{
                        text: '错误：无法访问页面内容',
                        xpath: ''
                    }]);
                    return;
                }

                if (response && response.success) {
                    displayResult(response.data);
                } else {
                    displayResult([{
                        text: '错误：' + (response ? response.error : '未知错误'),
                        xpath: ''
                    }]);
                }
            });
        });
    });

    clearBtn.addEventListener('click', function() {
        xpathInput.value = '';
        resultContainer.innerHTML = '';
    });
});

// 显示结果的函数
function displayResult(results) {
    if (!resultContainer) {
        console.error('结果容器未找到');
        return;
    }

    resultContainer.innerHTML = '';
    if (!results || results.length === 0) {
        resultContainer.innerHTML = '<p>未找到匹配结果</p>';
        return;
    }
    
    const ul = document.createElement('ul');
    results.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="result-item">
                <div class="result-text">${item.text || '空文本'}</div>
                ${item.xpath ? `<div class="result-xpath">${item.xpath}</div>` : ''}
            </div>
        `;
        ul.appendChild(li);
    });
    
    resultContainer.appendChild(ul);
} 