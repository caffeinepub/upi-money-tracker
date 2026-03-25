import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: bigint;
    date: string;
    time: string;
    type: string;
    account: string;
    utrNo: string;
    partyName: string;
    amount: number;
    transactionId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTransaction(transaction: Transaction): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearAllTransactions(): Promise<void>;
    deleteTransaction(transactionId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrency(): Promise<string>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCurrency(currency: string): Promise<void>;
}
