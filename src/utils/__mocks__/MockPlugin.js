// Used in loadPresets.spec.ts

module.exports = class MockPlugin {
  constructor() {
    this.extendVirtualFileSystem = jest.fn()
    this.version = '0.0.0'
    this.plugins = []
    this.title = 'mock:plugin'
  }
}
