import mongoose, { Document, Schema } from 'mongoose';

export interface ISport extends Document {
  name: string;
  slug: string;
  active: boolean;
  createdAt: Date;
}

const SportSchema = new Schema<ISport>({
  name: {
    type: String,
    required: [true, 'Please add a sport name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from name
SportSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/ /g, '-');
  next();
});

export const Sport = mongoose.model<ISport>('Sport', SportSchema);
