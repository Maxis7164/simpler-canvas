export class Layered<T = any> extends Array<T> {
  toPosition(member: T, position: number): void {
    if (position < 0) position = this.length + position; // +, because position is negative

    if (this.includes(member)) {
      const i = this.indexOf(member);

      this.splice(i, 1);
      this.splice(position, 0, member);
    }
  }
  toRelativePosition(member: T, position: number): void {
    if (this.includes(member)) {
      const i = this.indexOf(member);

      this.splice(i, 1);
      this.splice(i + position, 0, member);
    }
  }

  toStart(member: T): void {
    this.toPosition(member, 0);
  }
  toEnd(member: T): void {
    this.toPosition(member, -1);
  }

  set(items: T[]): void {
    this.splice(0, this.length, ...items);
  }

  get lastIndex(): number {
    return this.length - 1;
  }
}
