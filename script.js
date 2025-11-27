// script.js

// --- 數據鍵 ---
const LINK_KEY = 'userLinksByCategory'; // 變更 key 名稱，避免與舊數據衝突

// --- 預設數據 (結構變為物件) ---
let linksByCategory = {
    personal: [
        { name: '個人電郵', url: 'https://mail.google.com' }
    ],
    hobby: [
        { name: '遊戲論壇', url: 'https://www.ptt.cc/bbs/C_Chat/index.html' }
    ],
    work: [
        { name: '公司文件庫', url: 'https://drive.google.com' }
    ]
};

// --- DOM 元素引用 ---
// 我們現在需要引用所有清單容器
const linksListEls = {
    personal: document.getElementById('personalLinksList'),
    hobby: document.getElementById('hobbyLinksList'),
    work: document.getElementById('workLinksList')
};
const openSettingsBtns = document.querySelectorAll('.openSettingsBtn'); // 引用所有編輯按鈕

// 彈窗相關元素
const linkSettingsModal = document.getElementById('linkSettingsModal');
const linksInputEl = document.getElementById('linksInput');
const saveLinkBtn = document.getElementById('saveLinkSettings');
const closeLinkModalBtn = document.getElementById('closeLinkModal');
const modalTitleEl = document.getElementById('modalTitle');
const currentEditingCategoryEl = document.getElementById('currentEditingCategory');


// --- 核心函數：載入/保存 ---

function loadLinks() {
    const savedData = localStorage.getItem(LINK_KEY);
    if (savedData) {
        // 合併已保存的數據與預設數據 (確保所有類別都存在)
        const savedLinks = JSON.parse(savedData);
        linksByCategory = { ...linksByCategory, ...savedLinks };
    }
}

function saveLinks() {
    localStorage.setItem(LINK_KEY, JSON.stringify(linksByCategory));
    // 移除 alert，改用 console.log 避免打擾
    console.log('連結清單已保存！'); 
}


// --- 連結顯示邏輯 ---

function renderLinks() {
    // 遍歷所有類別並渲染
    Object.keys(linksByCategory).forEach(category => {
        const links = linksByCategory[category];
        const container = linksListEls[category];

        if (!container) return; // 防止找不到容器

        container.innerHTML = '';
        
        if (links.length === 0) {
            container.innerHTML = `<p style="color: var(--color-text-secondary);">目前沒有連結，點擊下方「編輯」新增。</p>`;
            return;
        }

        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            a.target = '_blank';
            container.appendChild(a);
        });
    });
}


// --- 編輯功能邏輯 ---

// 1. 開啟彈窗時
openSettingsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        const currentLinks = linksByCategory[category] || [];
        
        // 設置彈窗標題和隱藏欄位
        modalTitleEl.textContent = `編輯「${e.currentTarget.parentNode.querySelector('h2').textContent}」`;
        currentEditingCategoryEl.value = category;

        // 將當前連結轉換為 "名稱 | 網址" 格式填入 TextArea
        const linkText = currentLinks.map(link => `${link.name} | ${link.url}`).join('\n');
        linksInputEl.value = linkText;
        
        linkSettingsModal.style.display = 'flex';
    });
});

// 2. 保存按鈕點擊時
saveLinkBtn.addEventListener('click', () => {
    const rawText = linksInputEl.value;
    const editingCategory = currentEditingCategoryEl.value;
    const newLinks = [];
    
    // 處理每一行輸入，解析格式
    rawText.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        
        const parts = trimmedLine.split('|').map(p => p.trim());
        
        if (parts.length >= 2) {
            newLinks.push({
                name: parts[0],
                url: parts[1].startsWith('http') ? parts[1] : `https://${parts[1]}`
            });
        }
    });
    
    // 將新連結賦值給對應的類別
    linksByCategory[editingCategory] = newLinks;
    
    saveLinks();
    renderLinks();
    linkSettingsModal.style.display = 'none';
});

// 關閉彈窗
closeLinkModalBtn.addEventListener('click', () => {
    linkSettingsModal.style.display = 'none';
});


// --- 初始化 ---
loadLinks();
renderLinks();
