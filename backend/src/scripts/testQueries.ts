import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FlowOptionModel from '../models/FlowOption';

dotenv.config();

async function testQueries() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/itchatbot';
    console.log('Connecting to MongoDB:', mongoURI.replace(/:([^:@]+)@/, ':****@'));

    await mongoose.connect(mongoURI);
    console.log('Successfully connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection is not established');
      return;
    }

    // 1. Test the current query - parentId does not exist
    console.log('\n1. Testing query: parentId does not exist');
    const noParentOptions = await FlowOptionModel.find({
      parentId: { $exists: false }
    });
    console.log(`Query returned ${noParentOptions.length} documents`);

    // 2. Test query - parentId is null
    console.log('\n2. Testing query: parentId is null');
    const nullParentOptions = await FlowOptionModel.find({
      parentId: null
    });
    console.log(`Query returned ${nullParentOptions.length} documents`);

    // 3. Test query - parentId is empty string
    console.log('\n3. Testing query: parentId is empty string');
    const emptyParentOptions = await FlowOptionModel.find({
      parentId: ""
    });
    console.log(`Query returned ${emptyParentOptions.length} documents`);

    // 4. Test query - parentId does not exist OR parentId is null
    console.log('\n4. Testing query: parentId does not exist OR parentId is null');
    const combinedQuery = await FlowOptionModel.find({
      $or: [
        { parentId: { $exists: false } },
        { parentId: null }
      ]
    });
    console.log(`Query returned ${combinedQuery.length} documents`);

    // 5. Test query - find a few documents to see what root options look like
    console.log('\n5. Testing query: get sample documents to examine');
    const sampleDocs = await FlowOptionModel.find().limit(5);
    console.log(`Retrieved ${sampleDocs.length} sample documents:`);
    sampleDocs.forEach((doc, index) => {
      console.log(`Sample ${index + 1}:`, JSON.stringify(doc.toObject(), null, 2));
    });

  } catch (error) {
    console.error('Error during query testing:', error);
  } finally {
    if (mongoose.connection) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

testQueries();