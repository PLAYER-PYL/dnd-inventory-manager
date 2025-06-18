const socket = io();
let currentPlayerId = null;

// DOM 元素
const playerNameEl = document.querySelector('.self h2');
const privateInventory = document.querySelector('.self .item-list');
const publicInventory = document.querySelector('.public-warehouse .item-list');
const logContainer = document.querySelector('.log-entries');

// 加入游戏
playerNameEl.addEventListener('blur', () => {
  const playerName = playerNameEl.textContent.trim() || '无名冒险者';
  socket.emit('player-join', playerName);
});

// 骰子动画
document.querySelector('.dice-btn').addEventListener('click', () => {
  const result = Math.floor(Math.random() * 20) + 1;
  addLogEntry(`🎲 投掷检定: D20 = ${result}`);
  
  // 骰子动画效果
  const diceBtn = document.querySelector('.dice-btn');
  diceBtn.textContent = '...';
  setTimeout(() => {
    diceBtn.textContent = result;
    setTimeout(() => diceBtn.textContent = '🎲', 1000);
  }, 500);
});

// 处理游戏状态更新
socket.on('game-state', (state) => {
  currentPlayerId = socket.id;
  renderGameState(state);
});

// 渲染游戏状态
function renderGameState(state) {
  // 清空库存
  privateInventory.innerHTML = '';
  publicInventory.innerHTML = '';
  
  // 渲染私人库存
  if (state.players[currentPlayerId]) {
    state.players[currentPlayerId].inventory.forEach(item => {
      privateInventory.appendChild(createItemElement(item));
    });
  }
  
  // 渲染公共库存
  state.publicInventory.forEach(item => {
    publicInventory.appendChild(createItemElement(item));
  });
}

// 创建物品元素
function createItemElement(item) {
  const li = document.createElement('li');
  li.className = 'item';
  li.dataset.id = item.id;
  
  li.innerHTML = `
    <span class="item-name" contenteditable="true">${item.name}</span>
    <div class="item-actions">
      <button class="transfer-btn">➡️</button>
      <button class="delete-btn">🗑️</button>
    </div>
  `;
  
  // 添加重命名处理
  const nameSpan = li.querySelector('.item-name');
  nameSpan.addEventListener('blur', () => {
    socket.emit('rename-item', {
      itemId: item.id,
      newName: nameSpan.textContent
    });
  });
  
  // 添加转移按钮处理
  li.querySelector('.transfer-btn').addEventListener('click', () => {
    // 显示转移选项（到公共仓库或其他玩家）
    showTransferOptions(item.id);
  });
  
  return li;
}

// 添加操作日志
function addLogEntry(text) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logContainer.prepend(entry);
}

// 初始化
document.querySelectorAll('.add-item').forEach(btn => {
  btn.addEventListener('click', () => {
    socket.emit('add-item', {
      type: btn.closest('[data-type]').dataset.type
    });
  });
});
