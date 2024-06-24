const mongoose = require('mongoose');
const Thought = require('./models/Thought');
const User = require('./models/User');

// Database connection
mongoose.connect('mongodb://localhost/social-network-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Dummy data
const users = [
  {
    username: 'user1',
    email: 'user1@example.com',
  },
  {
    username: 'user2',
    email: 'user2@example.com',
  },
];

const thoughts = [
  {
    thoughtText: "Here's a cool thought...",
    username: 'user1',
    reactions: [
      {
        reactionBody: 'Nice thought!',
        username: 'user2',
      },
    ],
  },
  {
    thoughtText: "Another interesting thought!",
    username: 'user2',
    reactions: [
      {
        reactionBody: 'I agree!',
        username: 'user1',
      },
    ],
  },
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Thought.deleteMany({});

    // Insert dummy users
    const createdUsers = await User.insertMany(users);

    // Map user IDs to thoughts
    thoughts.forEach((thought, index) => {
      thought.userId = createdUsers[index % createdUsers.length]._id;
    });

    // Insert dummy thoughts
    const createdThoughts = await Thought.insertMany(thoughts);

    // Update user documents with thought references
    await Promise.all(
      createdUsers.map((user, index) =>
        User.findByIdAndUpdate(
          user._id,
          { $push: { thoughts: createdThoughts[index]._id } },
          { new: true }
        )
      )
    );

    console.log('Database seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
  }
};

// Execute the seed function
seedDatabase();
