import mongoose, { Document, Schema } from 'mongoose';

export interface IBet extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  amount: number;
  odds: number;
  selection: string;
  status: string;
  potentialWinnings: number;
  createdAt: Date;
}

const BetSchema = new Schema<IBet>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add a bet amount'],
    min: [1, 'Bet amount must be at least 1']
  },
  odds: {
    type: Number,
    required: [true, 'Please add odds']
  },
  selection: {
    type: String,
    required: [true, 'Please add a selection']
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled'],
    default: 'pending'
  },
  potentialWinnings: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate potential winnings before saving
BetSchema.pre('save', function(next) {
  this.potentialWinnings = this.amount * this.odds;
  next();
});

export const Bet = mongoose.model<IBet>('Bet', BetSchema);
