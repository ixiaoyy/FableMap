(() => {
  'use strict';
  const DATABASE = 'mirror-island-godot-v1';
  const STORE = 'saves';
  const MAX_BYTES = 8 * 1024 * 1024;
  /** 只访问新引擎自己的数据库和 main 槽；回调成功必须来自事务完成事件。 */
  function operate(mode, payload, callback) {
    let database = null;
    let transaction = null;
    let settled = false;
    let result = '';
    /** 只完成一次调用并关闭连接；不输出存档内容。 */
    function finish(ok, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (database) database.close();
      callback(ok, value);
    }
    const timeout = setTimeout(() => {
      if (transaction) { try { transaction.abort(); } catch {} }
      finish(false, '本地存档操作超时，请重试。');
    }, 10000);
    try {
      if (mode === 'write' && (typeof payload !== 'string' || new TextEncoder().encode(payload).length > MAX_BYTES)) {
        finish(false, '存档体积超过上限。'); return;
      }
      const opening = indexedDB.open(DATABASE, 1);
      opening.onupgradeneeded = () => opening.result.createObjectStore(STORE);
      opening.onerror = () => finish(false, '无法打开本地存档，请检查浏览器存储权限。');
      opening.onblocked = () => finish(false, '其他页面占用了存档，请关闭重复游戏页面。');
      opening.onsuccess = () => {
        database = opening.result;
        if (settled) { database.close(); return; }
        database.onversionchange = () => database.close();
        try {
          transaction = database.transaction(STORE, mode === 'write' ? 'readwrite' : 'readonly');
          const store = transaction.objectStore(STORE);
          const request = mode === 'write' ? store.put(payload, 'main') : store.get('main');
          request.onsuccess = () => { if (mode === 'read') result = request.result === undefined ? '' : request.result; };
          transaction.oncomplete = () => finish(typeof result === 'string', typeof result === 'string' ? result : '存档记录类型损坏。');
          transaction.onerror = transaction.onabort = () => finish(false, '本地保存未完成，原记录已保留，可以重试。');
        } catch { finish(false, '本地存档结构无法读取，原记录已保留。'); }
      };
    } catch { finish(false, '浏览器不允许本地存储，请检查权限。'); }
  }
  window.MirrorIslandSave = Object.freeze({
    /** 读取唯一槽，空字符串代表尚未创建存档。 */
    read(callback) { operate('read', null, callback); },
    /** 原子替换唯一槽；此层不解释或修改玩法内容。 */
    write(payload, callback) { operate('write', payload, callback); },
  });
})();
