import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function verifyDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/itchatbot';
    console.log('Connecting to MongoDB:', mongoURI.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

    await mongoose.connect(mongoURI);
    console.log('Successfully connected to MongoDB');

    // Get database name from connection
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection is not established');
      return;
    }

    const dbName = db.databaseName;
    console.log(`Current database: ${dbName}`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Check if our target collection exists
    const targetCollection = 'flowOptionBasesAiTest';
    const collectionExists = collections.some(col => col.name === targetCollection);
    console.log(`Collection '${targetCollection}' exists: ${collectionExists}`);

    // If collection exists, count documents
    if (collectionExists) {
      const count = await db.collection(targetCollection).countDocuments();
      console.log(`Documents in '${targetCollection}': ${count}`);

      // Show a sample document if any exist
      if (count > 0) {
        const sample = await db.collection(targetCollection).findOne();
        console.log('Sample document:');
        console.log(JSON.stringify(sample, null, 2));
      } else {
        console.log('No documents found in the collection.');
      }
    }
  } catch (error) {
    console.error('Error during database verification:', error);
  } finally {
    if (mongoose.connection) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

verifyDatabase();