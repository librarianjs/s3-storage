# Librarian S3 Storage

**Note**: This version of `librarian-s3-storage` is compatible with `librarian` 2.0.0 and above.

## Installation

```
$ npm install librarian-s3-storage
```

## Usage

```js
var express = require('express')
var librarian = require('librarian')
var S3Storage = require('librarian-s3-storage')
var storage = new S3Storage({
  bucket: 'my-cool-bucket',
  prefix: 'uploads',
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
})

var app = express()
app.use('/files', librarian({
    storage: storage
}))

app.listen(8888, function(){
    console.log('app listening')
})
```

## Options

### accessKeyId (required)

This is your Amazon S3 access key. Make sure that your key set has permission to access S3.

### secretAccessKey (required)
This is your Amazon S3 secret access key.

### bucket (required)

This is the bucket name that your files will be uploaded to.

### prefix (optional)

If you want to store file uploads in a bucket along side other files, adding a prefix will allow you to put all your uploads in a "folder". For example, a prefix of `uploads` will allow you to also use the prefix `assets`, `backups`, and `transfers` for other things in the same project.

### createBucket (optional)

If `true`, this option will create the bucket if it does not already exist. Defaults to `false`.
