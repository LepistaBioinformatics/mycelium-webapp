export default interface PaginatedRecords<T> {
    records: T[];
    count: number;
    size?: number | null;
    skip?: number | null;
}
