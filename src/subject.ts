export class Subject<T> {
  private listeners: Array<(value: T) => void> = [];

  constructor(private value: T) {}

  get() {
    return this.value;
  }

  set(value: T) {
    this.value = value;
    this.listeners.forEach((listener) => listener(value));
  }

  subscribe(callback: (value: T) => void) {
    this.listeners.push(callback);
    callback(this.value);
    return () => this.unsubscribe(callback);
  }

  unsubscribe(callback: (value: T) => void) {
    const i = this.listeners.indexOf(callback);
    if (i >= 0) this.listeners.splice(i, 1);
  }
}
