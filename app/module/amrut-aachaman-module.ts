import mongoose, { Schema, Document } from 'mongoose';

export interface IAmrutAachaman extends Document {
    image: string;
    description: string;
    date: string;
    timestamp: number;
}

const AmrutAachamanSchema: Schema = new Schema({
    image: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    timestamp: { type: Number, default: () => Date.now() }
}, { timestamps: true });

export default mongoose.model<IAmrutAachaman>('AmrutAachaman', AmrutAachamanSchema);