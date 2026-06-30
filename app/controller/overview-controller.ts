import { Request, Response } from "express";
import { OverviewService } from "../service/overview-service";

export class OverviewController {
    private overviewService: OverviewService;

    constructor() {
        this.overviewService = new OverviewService();
    }

    // GET API: Overview નો ડેટા ફ્રન્ટએન્ડ પર મોકલવા માટે
    public async getOverview(req: Request, res: Response): Promise<void> {
        try {
            const overviewData = await this.overviewService.getOverviewData();
            
            res.status(200).json({
                success: true,
                message: "Overview data fetched successfully.",
                data: overviewData
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error fetching overview data.",
                error: error.message
            });
        }
    }

    // POST API: એડમિન પેનલથી આવતો નવો ડેટા સેવ/અપડેટ કરવા માટે
    public async updateOverview(req: Request, res: Response): Promise<void> {
        try {
            /* 
               નોંધ: અત્યારે આપણે માની લઈએ છીએ કે ઈમેજની ફાઈનલ URLs req.body માં આવી રહી છે.
               જ્યારે તમે ફાઈલ અપલોડ (Multer/Cloudinary) ઉમેરશો, ત્યારે જો ઈમેજ ફાઈલ તરીકે આવે 
               તો req.files માંથી પાથ કાઢીને અહી સેટ કરવો પડશે.
            */
            const { heroSlider, featureImage, smartInfrastructure } = req.body;

            const updatedData = await this.overviewService.updateOverviewData({
                heroSlider,
                featureImage,
                smartInfrastructure
            });

            res.status(200).json({
                success: true,
                message: "Overview settings updated successfully.",
                data: updatedData
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Error updating overview data.",
                error: error.message
            });
        }
    }
}