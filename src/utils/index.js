class Utils {
  add0(num) {
    return num > 9 ? num + "" : "0" + num;
  }
  parseTime(timeStamp) {
    const date = new Date(timeStamp);
    return `${this.add0(date.getHours())}:${this.add0(
      date.getMinutes()
    )}:${this.add0(date.getSeconds())}`;
  }
  parseFullTime(timeStamp) {
    const date = new Date(timeStamp);
    return `${this.add0(date.getFullYear())}-${this.add0(
      date.getMonth() + 1
    )}-${this.add0(date.getDate())} ${this.add0(date.getHours())}:${this.add0(
      date.getMinutes()
    )}:${this.add0(date.getSeconds())}`;
  }
}
export default new Utils();
