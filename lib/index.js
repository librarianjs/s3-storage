'use strict'

const AWS = require('aws-sdk')
const merge = require('lodash.merge')

function promisify (fn) {
  return function () {
    let args = Array.from(arguments)

    return new Promise((resolve, reject) => {
      args.push((err, value) => {
        if (err) {
          reject(err)
        } else {
          resolve(value)
        }
      })

      fn.apply(null, args)
    })
  }
}

module.exports = class S3Storage {
  constructor (options) {
    this.options = merge({
      // There are no default options for now.
    }, options)

    if (!this.options.accessKeyId) {
      throw new Error('Missing options.accessKeyId')
    }
    if (!this.options.secretAccessKey) {
      throw new Error('Missing options.secretAccessKey')
    }

    this.s3 = new AWS.S3({
      accessKeyId: this.options.accessKeyId,
      secretAccessKey: this.options.secretAccessKey,
      sslEnabled: true
    })
    this._createBucket = promisify(this.s3.createBucket.bind(this.s3))
    this._listObjects = promisify(this.s3.listObjects.bind(this.s3))
    this._upload = promisify(this.s3.upload.bind(this.s3))
    this._download = promisify(this.s3.getObject.bind(this.s3))

    // For testing only
    this._deleteBucket = promisify(this.s3.deleteBucket.bind(this.s3))
    this._deleteObjects = promisify(this.s3.deleteObjects.bind(this.s3))
  }

  init () {
    return this._createBucket({
      Bucket: this.options.bucket,
      ACL: 'public-read'
    })
  }

  get (key) {
    return this._download({
      Bucket: this.options.bucket,
      Key: this._fileName(key)
    }).then(data => {
      return data.Body
    }).catch(err => {
      if (err.code === 'NoSuchKey') {
        return null
      } else {
        throw err
      }
    })
  }

  put (key, buffer) {
    return this._upload({
      Bucket: this.options.bucket,
      Key: this._fileName(key),
      Body: buffer
    })
  }

  _fileName (key) {
    let name = ''
    if (this.options.prefix) {
      name += this.options.prefix + '/'
    }
    return name + key
  }

  _destroy () {
    return this._listObjects({
      Bucket: this.options.bucket,
      Prefix: this.options.prefix
    }).then(objects => {
      objects = objects.Contents.map(obj => {
        return {Key: obj.Key}
      })
      return this._deleteObjects({
        Bucket: this.options.bucket,
        Delete: {
          Objects: objects
        }
      })
    })

    return this._deleteBucket({
      Bucket: this.options.bucket
    })
  }
}
