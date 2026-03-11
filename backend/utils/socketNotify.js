exports.notifyUser = (userId, event, data) => {
  if (global.io && global.connectedUsers) {
    const sid = global.connectedUsers[userId.toString()];
    if (sid) global.io.to(sid).emit(event, data);
  }
};
