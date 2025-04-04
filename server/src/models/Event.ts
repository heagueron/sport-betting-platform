import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  sport: mongoose.Types.ObjectId;
  name: string;
  startTime: Date;
  endTime: Date;
  status: string;
  participants: {
    name: string;
    odds: number;
  }[];
  result: string;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  sport: {
    type: Schema.Types.ObjectId,
    ref: 'Sport',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add an event name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  participants: [
    {
      name: {
        type: String,
        required: [true, 'Please add a participant name']
      },
      odds: {
        type: Number,
        required: [true, 'Please add odds for the participant']
      }
    }
  ],
  result: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);
