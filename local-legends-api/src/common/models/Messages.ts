export default class Message {
    id: number
    groupId: number;
    senderId: string;
    content: string;
    type: MessageType;
    sentAt: Date;
    isPinned: boolean;

    constructor(
        id: number, 
        groupId: number, 
        senderId: string, 
        content: string,
        type: MessageType,
        sentAt: Date,
        isPinned: boolean
    ) {
        this.id = id;
        this.groupId = groupId;
        this.senderId = senderId;
        this.content = content;
        this.type = type;
        this.sentAt = sentAt;
        this.isPinned = isPinned;
    }
}

export enum MessageType {
    Text = 'text',
    Image = 'image',
    System = 'system'
}