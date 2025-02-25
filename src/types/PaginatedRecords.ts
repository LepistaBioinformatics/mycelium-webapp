export default interface PaginatedRecords<T> {
    records: T[];
    count: number;
    size: number;
    skip: number;
}
