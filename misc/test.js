const path = require('path');
const fs = require('fs');

console.log(path.join(__dirname, '/uploads/images/img1'));

let data = path.join(__dirname, '/uploads/images/img1');

// Create a readable stream to write to a writeable stream 
const readStream = fs.createReadStream(data);
const writerStream = fs.createWriteStream('output.txt');

readStream.on('data', function(chunk) {
  writerStream.write(chunk);
});

readStream.on('end', function() {
  console.log('Read finished');
});

writerStream.on('finish', function() {
  console.log('Write completed.');
});



