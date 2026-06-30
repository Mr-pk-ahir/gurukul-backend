import AmrutAachaman, { IAmrutAachaman } from '../module/amrut-aachaman-module';

class AmrutAachamanService {
    
    async addRecord(data: { image: string; description: string; date: string }): Promise<IAmrutAachaman> {
        const count = await AmrutAachaman.countDocuments({ date: data.date });
        if (count >= 3) {
            throw new Error('You can only add up to 3 images per day!');
        }

        const newRecord = new AmrutAachaman({
            ...data,
            timestamp: Date.now()
        });

        return await newRecord.save();
    }

    async getRecentRecords(): Promise<IAmrutAachaman[]> {
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = Date.now() - thirtyDaysInMs;

        return await AmrutAachaman.find({ timestamp: { $gte: thirtyDaysAgo } })
                                  .sort({ timestamp: -1 });
    }
}

export default new AmrutAachamanService();