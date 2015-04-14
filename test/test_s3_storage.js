var fs = require( 'fs' )
var assert = require( 'assert' )
var stream = require( 'stream' )
var CloudStorage = require( '../lib' )

var id = process.env.AWS_ACCESS_KEY_ID
var secret = process.env.AWS_SECRET_ACCESS_KEY
if( !id || !secret ){
  console.log( 'AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY missing. Do you have a secret.conf?' )
  process.exit()
}

var MAX_TIMEOUT = process.env.MAX_TIMEOUT || 5000

describe( 's3-storage', function(){
  var testFileKey = 'test-file'
  var storage

  it( 'should be creatable', function(){
    this.timeout( MAX_TIMEOUT )
    storage = new CloudStorage({
      bucketName: 'joshwillik-test',
      uploadDirectory: 'test-uploads',
      accessKeyId: id,
      secretAccessKey: secret
    })
  })

  it( 'should init', function(){
    this.timeout( MAX_TIMEOUT )
    return storage.init()
  })

  it( 'should allow uploading a file by read stream', function( done ){
    this.timeout( MAX_TIMEOUT )
    return storage.put(
      testFileKey,
      fs.createReadStream( __dirname + '/test_upload_image.jpg' ),
      function( err ){
        done( err )
      }
    )
  })

  it( 'should allow downloading a file', function( done ){
    this.timeout( MAX_TIMEOUT )
    storage.get( testFileKey, function( err, file ){
      assert( !!file, 'Returned stream is undefined' )
      assert( !err, 'Downloading failed: ' + err )
      assert( file instanceof stream.Readable, 'Returned stream is not a readable stream' )
      done()
    } )
  })

  it( 'should resolve with an error when a bad key is given', function( done ){
    this.timeout( MAX_TIMEOUT )
    storage.get( 'a-random-key', function( err, file ){
      assert.equal( undefined, file )
      if( file ) {
        console.log( file )
      }
      assert( err, 'Error is not thrown' )
      done()
    })
  })
})
