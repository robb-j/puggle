const fakeCallback = jest.fn((...args: any[]) => {
  const [cb] = args.slice(-1)
  cb(null)
})

export default {
  readFile: fakeCallback,
  writeFile: fakeCallback,
  mkdir: fakeCallback
}
