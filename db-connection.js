const mongoose = require('mongoose');

// Replace 'your_mongodb_uri' with your actual MongoDB URI
const uri = "your db connection";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Further operations
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });
