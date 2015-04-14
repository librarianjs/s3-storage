# Librarian S3 Storage

## Installation
```
$ npm install librarian-s3-storage
```

## Usage
```js
var express = require( 'express' )
var librarian = require( 'librarian' )
var S3Storage = require( 'librarian-s3-storage' )
var storage = new S3Storage({
  bucketName: 'my-cool-bucket',
  uploadDirectory: 'uploads',
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
})

var app = express()
app.use( '/files', librarian({
    storageEngine: storage
}) )

app.listen( 8888, function(){
    console.log( 'app listening' )
})
```
