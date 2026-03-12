import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface T {
    id: string;
    status: Status;
    duration: string;
    contactInfo: string;
    adminRemark?: string;
    submittedBy: Principal;
    description: string;
    citizenName: string;
    createdTimestamp: bigint;
    category: Category;
    updatedTimestamp: bigint;
    severity: Severity;
    department: string;
    location: string;
}
export interface GrievanceStats {
    inProgressCount: bigint;
    totalGrievances: bigint;
    categoryCounts: Array<[Category, bigint]>;
    underReviewCount: bigint;
    resolvedCount: bigint;
    submittedCount: bigint;
}
export interface GrievanceInput {
    duration: string;
    contactInfo: string;
    description: string;
    citizenName: string;
    category: Category;
    severity: Severity;
    location: string;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    healthcare = "healthcare",
    public_safety = "public_safety",
    other = "other",
    roads_infrastructure = "roads_infrastructure",
    water_supply = "water_supply",
    education = "education",
    electricity = "electricity",
    sanitation = "sanitation"
}
export enum Severity {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum Status {
    resolved = "resolved",
    submitted = "submitted",
    in_progress = "in_progress",
    under_review = "under_review"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addRemark(id: string, remark: string): Promise<T>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllGrievances(): Promise<Array<T>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGrievanceById(id: string): Promise<T>;
    getMyGrievances(): Promise<Array<T>>;
    getStats(): Promise<GrievanceStats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitGrievance(input: GrievanceInput): Promise<[string, T]>;
    updateGrievanceStatus(id: string, newStatus: Status, remark: string | null): Promise<T>;
}
