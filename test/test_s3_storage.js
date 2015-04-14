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

describe( 's3-storage', function(){
  var testFileKey = 'test-file'
  var storage

  it( 'should be creatable', function(){
    storage = new CloudStorage({
      bucketName: 'joshwillik-test',
      uploadDirectory: 'test-uploads',
      accessKeyId: id,
      secretAccessKey: secret
    })
  })

  it( 'should init', function(){
    return storage.init()
  })

  it( 'should allow uploading a file by read stream', function( done ){
    this.timeout( 5000 )
    return storage.put(
      testFileKey,
      fs.createReadStream( __dirname + '/test_upload_image.jpg' ),
      function( err ){
        done( err )
      }
    )
  })

  it( 'should allow downloading a file', function( done ){
    storage.get( testFileKey, function( err, file ){
      assert( !!file, 'Returned stream is undefined' )
      assert( !err, 'Downloading failed: ' + err )
      assert( file instanceof stream.Readable, 'Returned stream is not a readable stream' )
      done()
    } )
  })
})
