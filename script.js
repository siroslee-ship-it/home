// script.js

// --- 數據鍵 ---
const LINK_KEY = 'userLinks';

// --- 預設數據 ---
let links = [
    { name: 'Google 搜尋', url: 'https://www.google.com' },
    { name: 'YouTube', url: 'https://www.youtube.com' },
    { name: 'GitHub 倉庫', url: 'https://github.com' }
];

// --- DOM 元素引用 ---
const linksListEl = document.getElementById('linksList');
const linkSettingsModal = document.getElementById('linkSettingsModal');
const linksInputEl = document.getElementById('linksInput');
const openLinkBtn = document.getElementById('openLinkSettings');
const saveLinkBtn = document.getElementById('saveLinkSettings');
const closeLinkModalBtn = document.getElementById('closeLinkModal');


// --- 核心函數：載入/保存 ---

function loadLinks() {
    const savedData = localStorage.getItem(LINK_KEY);
    if (savedData) {
        // 如果有保存的數據，則覆蓋預設數據
        links = JSON.parse(savedData);
    }
}

function saveLinks() {
    localStorage.setItem(LINK_KEY, JSON.stringify(links));
    alert('連結清單已保存！');
}


// --- 連結顯示邏輯 ---

function renderLinks() {
    linksListEl.innerHTML = '';
    
    if (links.length === 0) {
        linksListEl.innerHTML = '<p>點擊 "編輯連結" 新增您的第一個連結。</p>';
        return;
    }

    links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.name;
        a.target = '_blank'; // 在新分頁開啟
        linksListEl.appendChild(a);
    });
}


// --- 編輯功能邏輯 ---

openLinkBtn.addEventListener('click', () => {
    // 1. 將目前的 links 數據轉換為 "名稱 | 網址" 格式，填入 TextArea
    const linkText = links.map(link => `${link.name} | ${link.url}`).join('\n');
    linksInputEl.value = linkText;
    
    linkSettingsModal.style.display = 'flex'; // 顯示彈窗
});

saveLinkBtn.addEventListener('click', () => {
    const rawText = linksInputEl.value;
    const newLinks = [];
    
    // 2. 處理每一行輸入
    rawText.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return; // 跳過空行
        
        const parts = trimmedLine.split('|').map(p => p.trim());
        
        if (parts.length >= 2) {
            newLinks.push({
                name: parts[0],
                url: parts[1].startsWith('http') ? parts[1] : `https://${parts[1]}` // 自動補全 http/https
            });
        }
        // 如果格式不正確 (沒有 '|')，該行會被忽略
    });
    
    links = newLinks;
    saveLinks();    // 保存到 LocalStorage
    renderLinks();  // 更新畫面
    linkSettingsModal.style.display = 'none'; // 隱藏彈窗
});

// 關閉彈窗
closeLinkModalBtn.addEventListener('click', () => {
    linkSettingsModal.style.display = 'none';
});


// --- 初始化 ---
loadLinks();
renderLinks();
