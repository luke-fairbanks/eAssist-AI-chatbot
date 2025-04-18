import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/itchatbot';

    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log('Collections:', collections);
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;