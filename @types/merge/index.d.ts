declare function main(clone: boolean, ...items: any[]): any
declare namespace main {
  var clone: typeof import('.').clone
  var isPlainObject: typeof import('.').isPlainObject
  var recursive: typeof import('.').recursive
}
declare function main(...items: any[]): any
declare namespace main {
  var clone: typeof import('.').clone
  var isPlainObject: typeof import('.').isPlainObject
  var recursive: typeof import('.').recursive
}
declare function merge(clone: boolean, ...items: any[]): any
declare function merge(...items: any[]): any
declare function recursive(clone: boolean, ...items: any[]): any
declare function recursive(...items: any[]): any
declare function clone<T>(input: T): T
declare function isPlainObject(input: any): input is Object

declare module 'merge' {
  export = main
}
