const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 游戏状态存储
const gameState = {
  players: {},
  publicInventory: []
};

// 物品模板
const createItem = (name, type = 'misc') => ({
  id: uuidv4(),
  name,
  type,
  owner: 'public',
  description: ''
});

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  
  // 玩家加入游戏
  socket.on('player-join', (playerName) => {
    const playerId = socket.id;
    gameState.players[playerId] = {
      id: playerId,
      name: playerName,
      inventory: [
        createItem('短剑', 'weapon'),
        createItem('治疗药水', 'potion')
      ]
    };
    
    socket.emit('game-state', gameState);
    socket.broadcast.emit('player-joined', playerName);
  });

  // 重命名角色
  socket.on('rename-player', ({ playerId, newName }) => {
    if (gameState.players[playerId]) {
      gameState.players[playerId].name = newName;
      io.emit('player-renamed', { playerId, newName });
    }
  });

  // 物品操作
  socket.on('move-item', ({ itemId, from, to, targetPlayer }) => {
    // 实现物品移动逻辑...
    io.emit('item-moved', { itemId, to, targetPlayer });
  });

  // 更多监听器...
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
