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
let nextTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;


// --- DOM 元素引用 (確保所有元素都存在) ---

// 連結相關
const linksListEls = {
    personal: document.getElementById('personalLinksList'),
    hobby: document.getElementById('hobbyLinksList'),
    work: document.getElementById('workLinksList')
};
const openSettingsBtns = document.querySelectorAll('.openSettingsBtn');

// 連結彈窗相關
const linkSettingsModal = document.getElementById('linkSettingsModal');
const linksInputEl = document.getElementById('linksInput');
const saveLinkBtn = document.getElementById('saveLinkSettings');
const closeLinkModalBtn = document.getElementById('closeLinkModal');
const modalTitleEl = document.getElementById('modalTitle');
const currentEditingCategoryEl = document.getElementById('currentEditingCategory');

// Task 相關
const taskListEl = document.getElementById('taskList');
const newTaskInputEl = document.getElementById('newTaskInput');

// Task 編輯彈窗相關
const taskEditModal = document.getElementById('taskEditModal');
const taskEditTextEl = document.getElementById('taskEditText');
const saveTaskEditBtn = document.getElementById('saveTaskEdit');
const deleteTaskBtn = document.getElementById('deleteTask');
const closeTaskModalBtn = document.getElementById('closeTaskModal');
const currentEditingTaskIdEl = document.getElementById('currentEditingTaskId');


// ---------------------------------
// --- 數據持久化 (Save / Load) ---
// ---------------------------------

function loadLinks() {
    const savedData = localStorage.getItem(LINK_KEY);
    if (savedData) {
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

        if (!container) return;

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

// 開啟連結彈窗時
openSettingsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        const currentLinks = linksByCategory[category] || [];
        
        modalTitleEl.textContent = `編輯「${e.currentTarget.parentNode.querySelector('h2').textContent.split(' ')[1]}」連結`;
        currentEditingCategoryEl.value = category;

        const linkText = currentLinks.map(link => `${link.name} | ${link.url}`).join('\n');
        linksInputEl.value = linkText;
        
        linkSettingsModal.style.display = 'flex';
    });
});

// 保存連結按鈕點擊時
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

// 關閉連結彈窗
closeLinkModalBtn.addEventListener('click', () => {
    linkSettingsModal.style.display = 'none';
});


// ---------------------------------
// --- Task List 功能 (已驗證排序邏輯) ---
// ---------------------------------

function renderTasks() {
    taskListEl.innerHTML = '';
    
    // 核心排序邏輯：未完成在前 (false=0)，已完成在後 (true=1)
    const sortedTasks = [...tasks].sort((a, b) => a.completed - b.completed);

    sortedTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.dataset.taskId = task.id;

        // 只有未完成的項目可以拖曳
        if (!task.completed) {
            item.setAttribute('draggable', true);
        }
        
        if (task.completed) {
            item.classList.add('task-completed'); // <-- 關鍵：確保 class 被加入
        }

        item.innerHTML = `
            <input type="checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            
            <span class="task-actions">
                <span class="edit-icon" data-task-id="${task.id}">⚙️</span> 
            </span>
        `;
        
        taskListEl.appendChild(item);
    });
    
    attachTaskEventListeners(); // 重新綁定所有事件
}

// 改變 Task 完成狀態
function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks(); // <-- 關鍵：每次切換都強制重繪整個清單，實現移動效果
    }
}

// 新增 Task
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

// 綁定所有 Task 互動事件
function attachTaskEventListeners() {
    // 1. Checkbox 點擊事件
    taskListEl.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.onclick = function() {
            const taskId = parseInt(this.dataset.taskId); 
            toggleTaskCompletion(taskId);
        };
    });

    // 2. 編輯圖示點擊事件
    taskListEl.querySelectorAll('.edit-icon').forEach(icon => {
        icon.onclick = function(e) {
            e.stopPropagation();
            const taskId = parseInt(this.dataset.taskId);
            openTaskEditModal(taskId);
        };
    });
    
    // 3. 拖曳事件處理
    attachDragAndDropListeners();
}

// --- Task 編輯/刪除邏輯 ---

function openTaskEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    currentEditingTaskIdEl.value = taskId;
    taskEditTextEl.value = task.text;
    taskEditModal.style.display = 'flex';
}

saveTaskEditBtn.onclick = function() {
    const taskId = parseInt(currentEditingTaskIdEl.value);
    const newText = taskEditTextEl.value.trim();
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1 && newText) {
        tasks[taskIndex].text = newText;
        // 如果編輯後內容被修改，取消完成狀態，以回到可拖曳的未完成清單
        if (tasks[taskIndex].completed) {
             tasks[taskIndex].completed = false;
        }
        saveTasks();
        renderTasks();
        taskEditModal.style.display = 'none';
    } else if (!newText) {
        alert("內容不能為空！");
    }
};

deleteTaskBtn.onclick = function() {
    if (confirm("確定要刪除這個任務嗎？")) {
        const taskId = parseInt(currentEditingTaskIdEl.value);
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        taskEditModal.style.display = 'none';
    }
};

closeTaskModalBtn.onclick = function() {
    taskEditModal.style.display = 'none';
};


// --- Task 輸入框事件 ---

newTaskInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(newTaskInputEl.value);
        newTaskInputEl.value = '';
        e.preventDefault();
    }
});


// ---------------------------------
// --- 拖曳排序邏輯 (只對未完成項目生效) ---
// ---------------------------------

function attachDragAndDropListeners() {
    const taskItems = taskListEl.querySelectorAll('.task-item[draggable="true"]');
    
    taskItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.taskId);
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            // 視覺反饋：檢查目標是否為不同的項目，且目標必須是未完成的
            if (e.currentTarget !== item.parentElement.querySelector('.dragging') && !e.currentTarget.classList.contains('task-completed')) {
                document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                e.currentTarget.classList.add('drag-over');
            }
        });
        
        item.addEventListener('dragleave', (e) => {
             e.currentTarget.classList.remove('drag-over');
        });

        item.addEventListener('drop', handleDrop);
    });
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const draggedTaskId = parseInt(e.dataTransfer.getData('text/plain'));
    const targetTaskId = parseInt(e.currentTarget.dataset.taskId);
    
    // 確保目標也是未完成的項目，才允許排序
    const targetTask = tasks.find(t => t.id === targetTaskId);
    if (targetTask.completed) return; 

    if (draggedTaskId === targetTaskId) return;

    // 找到被拖曳和目標的索引
    const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = tasks.findIndex(t => t.id === targetTaskId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
        
        // 1. 確保只對未完成的項目進行排序，排除已完成項目
        const uncompletedTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);

        const draggedItem = uncompletedTasks.find(t => t.id === draggedTaskId);
        
        if (!draggedItem) return; // 再次檢查是否為未完成項目

        const draggedUncompletedIndex = uncompletedTasks.findIndex(t => t.id === draggedTaskId);
        const targetUncompletedIndex = uncompletedTasks.findIndex(t => t.id === targetTaskId);
        
        // 進行未完成陣列重排
        uncompletedTasks.splice(draggedUncompletedIndex, 1);
        uncompletedTasks.splice(targetUncompletedIndex, 0, draggedItem);
        
        // 重新組合 tasks 陣列 (未完成 + 已完成)
        tasks = [...uncompletedTasks, ...completedTasks];
        
        saveTasks();
        renderTasks();
    }
}


// ---------------------------------
// --- 網站初始化 ---
// ---------------------------------

function initializeDashboard() {
    // 連結初始化
    loadLinks();
    renderLinks();
    
    // Task 初始化
    renderTasks();
}

// 啟動應用程式
initializeDashboard();
