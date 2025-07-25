import { ENV } from "@/config/env";

export interface DashboardSummary {
    totalLoans: number;
    overdueLoans: number;
    totalFines: number;
    totalReservations: number;
    availableReservations: number;
    booksByCategory: Record<string, number>;
}

export interface MonthlyLoan {
    month: string; // e.g. "2025-07"
    count: number;
}

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
    const res = await fetch(`${ENV.apiUrl}/Dashboard/summary`);
    if (!res.ok) throw new Error("Failed to fetch summary");
    return await res.json();
};

export const fetchMonthlyLoans = async (): Promise<MonthlyLoan[]> => {
    const res = await fetch(`${ENV.apiUrl}/Dashboard/monthly-loans`);
    if (!res.ok) throw new Error("Failed to fetch monthly loans");
    const data = await res.json();
    return data.$values || [];
};
