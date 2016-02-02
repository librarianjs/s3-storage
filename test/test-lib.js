'use strict'

const assert = require('assert')
const fs = require('fs')
const S3Storage = require('../')

let id = process.env.AWS_ACCESS_KEY_ID
let secret = process.env.AWS_SECRET_ACCESS_KEY
if (!(id && secret)) {
  console.log( 'AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY missing. Do you have a secret.conf?' )
  process.exit()
}

const TEST_KEY = 'test-key'
const FAKE_KEY = 'fake-key'
const TEST_DATA = fs.readFileSync(__dirname + '/test_upload_image.jpg')
const TEST_TIMEOUT = 10000

describe('S3Storage', () => {
  describe('default configuration', () => {
    let plugin = new S3Storage({
      accessKeyId: id,
      secretAccessKey: secret,
      bucket: 'librarian-test-' + Date.now()
    })

    after( function () {
      this.timeout(TEST_TIMEOUT)
      // This is not a public API, I just use this to destroy the bucket when I'm done testing.
      return plugin._destroy()
    })

    it('should init()', function () {
      this.timeout(TEST_TIMEOUT)
      return plugin.init()
    })

    it('should put()', function () {
      this.timeout(TEST_TIMEOUT)
      return plugin.put(TEST_KEY, TEST_DATA)
    })

    it('should get()', function () {
      this.timeout(TEST_TIMEOUT)

      return plugin.get(TEST_KEY).then(fetched => {
        if (TEST_DATA.compare(fetched) !== 0) {
          throw new Error('Data is not the same when fetched')
        }
      })
    })

    it('should return null for a get() of a missing key', function () {
      this.timeout(TEST_TIMEOUT)

      return plugin.get(FAKE_KEY).then(data => {
        assert.equal(data, null)
      })
    })
  })

  describe('with bucket prefix', () => {
    let plugin = new S3Storage({
      accessKeyId: id,
      secretAccessKey: secret,
      bucket: 'librarian-prefix-test-' + Date.now(),
      prefix: 'uploads'
    })

    after( function () {
      this.timeout(TEST_TIMEOUT)
      // This is not a public API, I just use this to destroy the bucket when I'm done testing.
      return plugin._destroy()
    })

    it('should init()', function () {
      this.timeout(TEST_TIMEOUT)
      return plugin.init()
    })

    it('should put()', function () {
      this.timeout(TEST_TIMEOUT)
      return plugin.put(TEST_KEY, TEST_DATA)
    })

    it('should get()', function () {
      this.timeout(TEST_TIMEOUT)

      return plugin.get(TEST_KEY).then(fetched => {
        if (TEST_DATA.compare(fetched) !== 0) {
          throw new Error('Data is not the same when fetched')
        }
      })
    })

    it('should return null for a get() of a missing key', function () {
      this.timeout(TEST_TIMEOUT)

      return plugin.get(FAKE_KEY).then(data => {
        assert.equal(data, null)
      })
    })
  })
})
