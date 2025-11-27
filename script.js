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

        if (!container) return; //
