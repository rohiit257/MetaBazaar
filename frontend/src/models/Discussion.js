import mongoose from 'mongoose';

const DiscussionSchema = new mongoose.Schema({
  author: { 
    type: String,
     required: true 
    }, 
  content: { 
    type: String,
     required: true 
    }, 
  createdAt: {
     type: Date, 
     default: Date.now 
    }, 
});

export default mongoose.models.Discussion || mongoose.model('Discussion', DiscussionSchema);
