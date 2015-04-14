var Promise = require( 'bluebird' )
var AWS = require( 'aws-sdk' )
var stream = require( 'stream' )

function _generateFileName( key, options ){
  options = options || {}
  var url = this.uploadDirectory + '/' + key
  if( options.width ){
    url += '-'
    if( options.height ){
      url += options.width + 'x' + options.height
    } else {
      url += options.width
    }
  }
  return url
}

function _cacheKey(){

}

function _initBucket(){
  if( ! this.initPromise ){
    this.initPromise = this.s3.createBucketAsync({
      Bucket: this.bucketName,
      ACL: 'public-read'
    }).then( function bucketCreated( bucket ){
      this.bucket = bucket
    }.bind( this ) )
  }

  return this.initPromise
}

function uploadFile( key, fileStream, callback, options ){
  this.ensureInit().then( function(){
    return this.s3.uploadAsync({
      Bucket: this.bucketName,
      Key: this.fileName( key ),
      Body: fileStream
    }).then( function( res ){
      callback( null, res )
    }, callback )
  }.bind( this ) )
}

function fetchFile( id, callback ){
  this.ensureInit().then( function(){
    var request = this.s3.getObject({
      Bucket: this.bucketName,
      Key: this.fileName( id )
    }, function( err, data ){
      if( err ){
        callback( err )
      } else {
        callback( null, request.createReadStream() )
      }
    })
  }.bind( this ) )
}

function CloudStorage( options ){
  options = options || {}
  var accessKey = options.accessKeyId || process.env.AWS_ACCESS_KEY_ID || false
  var secretKey = options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || false
  if( !( accessKey && secretKey ) ){
    throw new Error( 'AWS credentials not provided' )
  }
  Promise.promisifyAll( AWS.S3.prototype )
  this.s3 = new AWS.S3({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    sslEnabled: true
  })

  this.bucketName = options.bucketName || 'willikhomes-website'
  this.cache = options.cache || true
  this.cacheDirectory = options.cacheDirectory || (function( min, max ){
    return '/tmp/cloud-storage-cache-' +
      Math.round( Math.random() * ( max - min ) ) + min
  })( 1000, 10000 )
  this.uploadDirectory = options.uploadDirectory || 'uploads'

  this.ensureInit()
}

CloudStorage.prototype = {
  init: _initBucket,
  ensureInit: _initBucket,
  put: uploadFile,
  get: fetchFile,
  cache: _cacheKey,
  fileName: _generateFileName
}

module.exports = CloudStorage
