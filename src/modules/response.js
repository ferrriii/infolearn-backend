export default function (response) {
  const res = response
  const isDebug = process.env.DEBUG

  function debugException (err) {
    if (typeof err === 'string') {
      err = { message: err }
    }
    res.status(500).json({
      error: {
        msg: err.message,
        name: err.name,
        fileName: err.fileName,
        lineNumber: err.lineNumber,
        columnNumber: err.columnNumber,
        stack: err.stack
      }
    })
  }

  function productionException () {
    res.status(500).json({
      error: {
        msg: 'something went wrong'
      }
    })
  }

  return {
    error (code, msg) {
      res.status(code).json({ error: { code, msg } })
    },
    exception (err) {
      if (isDebug) {
        debugException(err)
      } else {
        productionException()
      }
    },
    success (data) {
      res.json({ data })
    }
  }
}
