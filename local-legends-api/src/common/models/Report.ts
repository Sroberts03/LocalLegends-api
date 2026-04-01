export default class Report {
    id: number;
    reporterId: string;
    reportedUserId: string;
    reason: string;
    groupId?: number;
    createdAt: Date;

    constructor(
        id: number,
        reporterId: string,
        reportedUserId: string,
        reason: string,
        groupId: number | undefined,
        createdAt: Date
    ) {
        this.id = id;
        this.reporterId = reporterId;
        this.reportedUserId = reportedUserId;
        this.reason = reason;
        this.groupId = groupId;
        this.createdAt = createdAt;
    }
}