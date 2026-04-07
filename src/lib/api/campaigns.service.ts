import { CampaignEvent, CreateCampaignPayload } from '@/types/marketing.types';
import apiClient from './client';

const CampaignsService = {
    async getEvent(): Promise<CampaignEvent[]> {
        const { data } = await apiClient.get<CampaignEvent[]>('/marketing/events/active');
        return data;
    },

    async getEventProducts(eventId: string | number, params?: any): Promise<{ data: any[], meta: any }> {
        const response = await apiClient.get(`/marketing/events/admin/${eventId}/products`, {
        params: params
        });
        return response.data;
    },

    async getEventBySlug(slug: string, params?: any): Promise<any> {
        const { data } = await apiClient.get(`/marketing/events/slug/${slug}`, {
            params: params 
        });
        return data;
    },

};

export default CampaignsService;