// --- 數據鍵 ---
const LINK_KEY = 'userLinksByCategory';
const TASK_KEY = 'userTasks';

// --- 連結數據結構 ---
let linksByCategory = {
    personal: [
        { name: '個人電郵', url: 'https://mail.google.com' },
        { name: '行事曆', url: 'https://calendar.google.com' }
    ],
    hobby: [
        { name: '遊戲論壇', url: 'https://www.ptt.cc/bbs/C_Chat/index.html' }
    ],
    work: [
        { name: '公司文件庫', url: 'https://drive.google.com' }
    ]
};

// --- Task 數據結構 ---
let tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || [
    { id: 1, text: '發布個人化首頁 V1', completed: true },
    { id: 2, text: '撰寫放置遊戲的程式碼', completed: false }
];
// 確保 ID 唯一性
let nextTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;


// --- DOM 元素引用 ---

// 連結相關
const linksListEls = {
    personal: document.getElementById('personalLinksList'),
    hobby: document.getElementById('hobbyLinksList'),
    work: document.getElementById('workLinksList')
};
const openSettingsBtns = document.querySelectorAll('.openSettingsBtn');

// 彈窗相關
const linkSettingsModal = document.getElementById('linkSettingsModal');
const linksInputEl = document.getElementById('linksInput');
const saveLinkBtn = document.getElementById('saveLinkSettings');
const closeLinkModalBtn = document.getElementById('closeLinkModal');
const modalTitleEl = document.getElementById('modalTitle');
const currentEditingCategoryEl = document.getElementById('currentEditingCategory');

// Task 相關
const taskListEl = document.getElementById('taskList');
const newTaskInputEl = document.getElementById('newTaskInput');


// ---------------------------------
// --- 數據持久化 (Save / Load) ---
// ---------------------------------

function loadLinks() {
    const savedData = localStorage.getItem(LINK_KEY);
    if (savedData) {
        // 合併已保存的數據與預設數據
        const savedLinks = JSON.parse(savedData);
        linksByCategory = { ...linksByCategory, ...savedLinks };
    }
}

function saveLinks() {
    localStorage.setItem(LINK_KEY, JSON.stringify(linksByCategory));
    console.log('連結清單已保存。');
}

function saveTasks() {
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    console.log('Tasks saved.');
}


// ---------------------------------
// --- 連結功能 (Render / Edit) ---
// ---------------------------------

function renderLinks() {
    Object.keys(linksByCategory).forEach(category => {
        const links = linksByCategory[category];
        const container = linksListEls[category];

        if (!container) return; // 避免錯誤

        container.innerHTML = '';
        
        if (links.length === 0) {
            container.innerHTML = `<p style="color: var(--color-text-secondary); font-size: 0.9em;">點擊「編輯」新增連結。</p>`;
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


// --- 編輯功能事件監聽 ---

// 開啟彈窗時
openSettingsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        const currentLinks = linksByCategory[category] || [];
        
        // 設置彈窗標題和隱藏欄位
        modalTitleEl.textContent = `編輯「${e.currentTarget.parentNode.querySelector('h2').textContent.split(' ')[1]}」連結`;
        currentEditingCategoryEl.value = category;

        // 將當前連結轉換為 "名稱 | 網址" 格式填入 TextArea
        const linkText = currentLinks.map(link => `${link.name} | ${link.url}`).join('\n');
        linksInputEl.value = linkText;
        
        linkSettingsModal.style.display = 'flex'; // 顯示彈窗
    });
});

// 保存按鈕點擊時
saveLinkBtn.addEventListener('click', () => {
    const rawText = linksInputEl.value;
    const editingCategory = currentEditingCategoryEl.value;
    const newLinks = [];
    
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
    
    linksByCategory[editingCategory] = newLinks;
    
    saveLinks();
    renderLinks();
    linkSettingsModal.style.display = 'none';
});

// 關閉彈窗
closeLinkModalBtn.addEventListener('click', () => {
    linkSettingsModal.style.display = 'none';
});


// ---------------------------------
// --- Task List 功能 ---
// ---------------------------------

function renderTasks() {
    taskListEl.innerHTML = '';
    
    // 依據完成狀態分組：未完成在前 (false = 0)，已完成在後 (true = 1)
    const sortedTasks = [...tasks].sort((a, b) => a.completed - b.completed);

    sortedTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-item';
        
        if (task.completed) {
            item.classList.add('task-completed');
        }

        item.innerHTML = `
            <input type="checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
        `;
        
        taskListEl.appendChild(item);
    });
    
    attachTaskEventListeners();
}

function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks(); // 重新渲染以實現排序和刪除線
    }
}

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

function attachTaskEventListeners() {
    // 監聽 Checkbox 點擊事件
    taskListEl.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        // 使用 onclick 確保邏輯在每次點擊時運行
        checkbox.onclick = function() {
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
        e.preventDefault(); // 防止換行
    }
});


// ---------------------------------
// --- 網站初始化 ---
// ---------------------------------

function initializeDashboard() {
    // 連結初始化
    loadLinks();
    renderLinks();
    
    // Task 初始化
    // loadTasks() 已經在變數初始化時完成
    renderTasks();
}

// 啟動應用程式
initializeDashboard();
