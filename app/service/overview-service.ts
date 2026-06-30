import { OverviewModel, IOverview } from "../module/overview-module";

export class OverviewService {
    
    public async getOverviewData(): Promise<IOverview> {
        let overview = await OverviewModel.findOne();
        
        if (!overview) {
            overview = await OverviewModel.create({
                heroSlider: [],
                featureImage: [],
                smartInfrastructure: []
            });
        }
        return overview;
    }

    public async updateOverviewData(data: Partial<IOverview>): Promise<IOverview | null> {
        let overview = await OverviewModel.findOne();
        
        if (!overview) {
            return await OverviewModel.create(data);
        } else {
            return await OverviewModel.findByIdAndUpdate(
                overview._id,
                { $set: data },
                { new: true }
            );
        }
    }
}