class QueueLink {
  constructor(value, before) {
    if (before)
      before.next = this
    this.value = value
  }
}
/**
 * An iterable FIFO structure that implements the *push* and *shift* queue methods just like Arrays,
 * but based on a linked list for improved performance.
 */
export default class Queue {
  constructor(...initArgs) {
    this._len = 0
    for (const value of initArgs)
      this.push(value)
  }
  [Symbol.iterator]() {
    return this.values()
  }
  *values() {
    for (var link = this._first; link; link = link.next)
      yield link.value
  }
  /** _Assuming the queue's items are ordered by an 'id' property_, iterate over items with a higher id only. */
  *valuesAfterID(id) {
    if (this._last.value.id === id) return // try last item just in case nothing new was added since requested ID
    if (this._last.value.id - 1 === id) var link = this._last // assuming ordered IDs, this must be the only match
    else for (link = this._first; link && link.value.id <= id; link = link.next); // else go the long way around
    for (; link; link = link.next) yield link.value
  }
  get length() {
    return this._len
  }
  get first() {
    return this._first.value
  }
  push(value) {
    const link = new QueueLink(value, this._last)
    this._last = link
    if (!this._len)
      this._first = link
    return ++this._len
  }
  shift() {
    if (!this._len)
      return null
    const link = this._first
    this._first = link.next
    link.next = null
    if (!--this._len)
      this._last = null
    return link.value
  }
}
