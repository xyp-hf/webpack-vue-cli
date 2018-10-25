class StorageService {
  setHistory(history) {
    const oldHistory = JSON.parse(this.getHistory()) || [];
    history = oldHistory
      .concat(history)
      .filter(item => item.sender === 0 || item.sender === 1);
    history =
      history.length > 10
        ? history.slice(history.length - 10, history.length)
        : history;
    localStorage.setItem("servF", JSON.stringify(history));
  }
  getHistory() {
    return localStorage.getItem("servF");
  }
  setHistoryToken(historyToken) {
    localStorage.setItem("historyToken", historyToken);
  }
  getHistoryToken() {
    return localStorage.getItem("historyToken");
  }
  setCurToken(curToken) {
    localStorage.setItem("curToken", curToken);
  }
  getCurToken() {
    return localStorage.getItem("curToken");
  }
}

export default new StorageService();
