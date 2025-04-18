import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FlowOptionModel from '../models/FlowOption';

dotenv.config();

// Sample flow options data for IT support
const sampleFlowOptions = [
  // Root level issues (no parentId)
  {
    message: "I can't connect to the internet",
    isMenu: true
  },
  {
    message: "My computer is running slowly",
    isMenu: true
  },
  {
    message: "I need to reset my password",
    isMenu: true
  },
  {
    message: "I'm having issues with my email",
    isMenu: true
  },
  {
    message: "I need software installed on my computer",
    isMenu: true
  },

  // Second level - Internet connectivity issues
  {
    message: "I'm using Wi-Fi",
    parentId: "internet_parent_id", // Will be replaced with actual _id
    isMenu: true
  },
  {
    message: "I'm using a wired connection",
    parentId: "internet_parent_id", // Will be replaced with actual _id
    isMenu: true
  },

  // Second level - Slow computer issues
  {
    message: "It's been slow since startup",
    parentId: "slow_computer_parent_id", // Will be replaced with actual _id
    isMenu: true
  },
  {
    message: "It just started happening recently",
    parentId: "slow_computer_parent_id", // Will be replaced with actual _id
    isMenu: true
  },

  // Second level - Password reset
  {
    message: "I need to reset my Windows login password",
    parentId: "password_reset_parent_id", // Will be replaced with actual _id
    isMenu: true
  },
  {
    message: "I need to reset my email password",
    parentId: "password_reset_parent_id", // Will be replaced with actual _id
    isMenu: true
  },

  // Third level - Wi-Fi issues
  {
    message: "I can see Wi-Fi networks but can't connect",
    parentId: "wifi_parent_id", // Will be replaced with actual _id
    closesTicket: true,
    type: "connectivity",
    severity: 2
  },
  {
    message: "I don't see any Wi-Fi networks",
    parentId: "wifi_parent_id", // Will be replaced with actual _id
    closesTicket: true,
    type: "hardware",
    severity: 3
  },

  // Third level - Wired connection issues
  {
    message: "The Ethernet cable is connected but no internet",
    parentId: "wired_parent_id", // Will be replaced with actual _id
    closesTicket: true,
    type: "connectivity",
    severity: 2
  },
  {
    message: "The Ethernet port on my computer seems damaged",
    parentId: "wired_parent_id", // Will be replaced with actual _id
    closesTicket: true,
    type: "hardware",
    severity: 3
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/itchatbot';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await FlowOptionModel.deleteMany({});
    console.log('Cleared existing flow options');

    // Create root level items first
    const internetIssue = await FlowOptionModel.create(sampleFlowOptions[0]);
    const slowComputerIssue = await FlowOptionModel.create(sampleFlowOptions[1]);
    const passwordResetIssue = await FlowOptionModel.create(sampleFlowOptions[2]);
    await FlowOptionModel.create(sampleFlowOptions[3]); // Email issues (no children in this example)
    await FlowOptionModel.create(sampleFlowOptions[4]); // Software installation (no children in this example)

    // Create second level items with correct parent IDs
    const wifiIssue = await FlowOptionModel.create({
      ...sampleFlowOptions[5],
      parentId: internetIssue._id.toString()
    });

    const wiredIssue = await FlowOptionModel.create({
      ...sampleFlowOptions[6],
      parentId: internetIssue._id.toString()
    });

    await FlowOptionModel.create({
      ...sampleFlowOptions[7],
      parentId: slowComputerIssue._id.toString()
    });

    await FlowOptionModel.create({
      ...sampleFlowOptions[8],
      parentId: slowComputerIssue._id.toString()
    });

    await FlowOptionModel.create({
      ...sampleFlowOptions[9],
      parentId: passwordResetIssue._id.toString()
    });

    await FlowOptionModel.create({
      ...sampleFlowOptions[10],
      parentId: passwordResetIssue._id.toString()
    });

    // Create third level items
    await FlowOptionModel.create({
      ...sampleFlowOptions[11],
      parentId: wifiIssue._id.toString()
    });

    await FlowOptionModel.create({
      ...sampleFlowOptions[12],
      parentId: wifiIssue._id.toString()
    });

    await FlowOptionModel.create({
      ...sampleFlowOptions[13],
      parentId: wiredIssue._id.toString()
    });

    await FlowOptionModel.create({
      ...sampleFlowOptions[14],
      parentId: wiredIssue._id.toString()
    });

    console.log('Sample flow options seeded successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();