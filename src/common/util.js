function getLocalStorage(key, defaultValue) {
  try {
    const value = window.localStorage.getItem(key);
    const result = JSON.parse(value);
    if (result === 0) { //因为 0 || * 最后返回的都是*，做个特殊处理。
      return result;
    }
    return result || defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // do nothing.
  }
}

function uniqueId() {
  const template = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += template[Math.floor(Math.random() * template.length)];
  }
  return result;
}

export {
  getLocalStorage,
  setLocalStorage,
  uniqueId,
};
