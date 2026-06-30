import mongoose, { Schema, Document } from "mongoose";

export interface IOverview extends Document {
    heroSlider: string[];
    featureImage: string[];
    smartInfrastructure: string[];
}

const OverviewSchema: Schema = new Schema({
    heroSlider: { type: [String], default: [] },
    featureImage: { type: [String], default: [] },
    smartInfrastructure: { type: [String], default: [] },
}, { 
    timestamps: true 
});

export const OverviewModel = mongoose.model<IOverview>("Overview", OverviewSchema);