export default class WebSocketService {
  constructor(url) {
    this.url = url;
    this.io = null;
    this.init();
  }
  init() {
    this.io = new WebSocket(this.url);
  }
  send(msg) {
    this.io.send(msg);
  }
  close() {
    this.io.close();
  }
  onopen(cb) {
    this.io.onopen = ev => {
      cb(ev);
    };
  }
  onmessage(cb) {
    this.io.onmessage = ev => {
      cb(ev);
    };
  }
  onerror(cb) {
    this.io.onerror = ev => {
      cb(ev);
    };
  }
  onclose(cb) {
    this.io.onclose = ev => {
      cb(ev);
    };
  }
}
