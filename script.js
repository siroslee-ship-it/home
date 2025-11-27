// script.js

// --- Task 數據鍵 ---
const TASK_KEY = 'userTasks';

// --- Task 數據結構 ---
let tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || [
    { id: 1, text: '更新個人首頁的 Task List 功能', completed: false },
    { id: 2, text: '檢查 GitHub Pages 部署是否成功', completed: false },
    { id: 3, text: '發布第一版放置遊戲 MVP', completed: true }
];
let nextTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;


// --- DOM 元素引用 (新增 Task 相關) ---
const taskListEl = document.getElementById('taskList');
const newTaskInputEl = document.getElementById('newTaskInput');


// --- Task 數據持久化 ---

function saveTasks() {
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    console.log('Tasks saved.');
}

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

// script.js (新增 Task 相關功能)

function renderTasks() {
    taskListEl.innerHTML = '';
    
    // 1. 依據完成狀態分組：未完成在前，已完成在後
    const sortedTasks = [...tasks].sort((a, b) => a.completed - b.completed);

    sortedTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-item';
        
        // 根據狀態添加 completed class
        if (task.completed) {
            item.classList.add('task-completed');
        }

        item.innerHTML = `
            <input type="checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
        `;
        
        taskListEl.appendChild(item);
    });
    
    // 重新綁定 Checkbox 的事件
    attachTaskEventListeners();
}


// --- Task 互動邏輯 ---

function addTask(text) {
    if (!text.trim()) return;
    
    const newTask = {
        id: nextTaskId++,
        text: text.trim(),
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks(); // 重新渲染以實現排序和刪除線
    }
}

function attachTaskEventListeners() {
    // 移除舊的監聽器是最佳做法，但對於新手專案，直接重新綁定也可以
    
    // 監聽 Checkbox 點擊事件
    taskListEl.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        // 使用 once:true 確保每個 Checkbox 只被綁定一次
        checkbox.onclick = function() {
            // 從 data 屬性獲取 ID，並轉換為數字
            const taskId = parseInt(this.dataset.taskId); 
            toggleTaskCompletion(taskId);
        };
    });
}


// --- Task 輸入框事件 ---

newTaskInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(newTaskInputEl.value);
        newTaskInputEl.value = ''; // 清空輸入框
    }
});


// --- 整合到初始化流程 ---

// 在您的初始化區塊 (文件的最底部)
// 確保 Task 相關功能也被啟動
loadLinks();
// loadTasks(); // 已經在變數初始化時載入
renderLinks();
renderTasks(); // 啟動 Task List 渲染

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
