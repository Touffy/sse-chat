import stream from 'stream'

/** Read up to *max* bytes from the readable *stream*
 * @param {stream.Readable} stream
 * @returns {Promise<Buffer>}
 */
export default function readStream(rstr, max = Infinity) {
  if (!(rstr instanceof stream.Readable)) return Promise.reject(new TypeError('Argument must be a readable stream.'))
  if (!rstr.readable || rstr.closed || rstr.destroyed) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const bufferArray = []
    let currentLength = 0

    function onData(chunk) {
      bufferArray.push(chunk.slice(0, max - currentLength))
      currentLength += chunk.byteLength
      if (currentLength > max) rstr.destroy(new RangeError('Too Much Data.'))
    }

    function onceEnd() {
      rstr.removeListener('data', onData)
      rstr.removeListener('error', onceError)
      resolve(Buffer.concat(bufferArray))
    }

    function onceError(err) {
      rstr.removeListener('data', onData)
      rstr.removeListener('end', onceEnd)
      reject(err)
    }

    rstr.on('data', onData)
    rstr.once('end', onceEnd)
    rstr.once('error', onceError)
    rstr.resume()
  })
}
