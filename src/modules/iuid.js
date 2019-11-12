let last = 0
export default () => {
  // return process.hrtime.bigint()
  let t = Number.parseInt(Date.now() + '000')
  if (t <= last) {
    t = last + 1
  }
  last = t
  return t
}
