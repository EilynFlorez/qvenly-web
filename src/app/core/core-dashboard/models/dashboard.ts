export interface GeneralStats {
    totalUsers: number;
    totalOrganizers: number;
    totalStaff: number;
    totalGuests: number;
    totalEvents: number;
}


export interface PlanStats{
    planName: string;
    numberOrganizers: number;
}

export interface PlanStatsResponse{
    plans: PlanStats[];
    featuredPlan: string;
}

export interface EventByOrganizer{
    organizerId: number;
    organizerName: string;
    numberEvents: number;
}

export interface EventByOrganizerResponse{
    organizers: EventByOrganizer[];
    topOrganizer: string;
}

export interface EventUserDetail{
    eventId: number;
    eventName: string;
    staff: number;
    guests: number;
}

export interface MonthlyGrowh{
    month: string;
    newUsers: number;
}

export interface MonthlyGrowthResponse{
    months: MonthlyGrowh[];
    peakMonth: string;
}
