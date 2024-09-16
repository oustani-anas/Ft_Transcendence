export declare class ChatChannelDTO {
    name: string;
    avatar: string;
    status: 'Public' | 'Private' | 'Protected';
    owner: string;
    type?: 'DM' | '';
    members?: string[];
    password?: string;
}
export declare class ChangeToProtected {
    roomId: string;
    userId: string;
    password: string;
    token: string;
}
export declare class ChangeProtectedChannelPassword {
    roomId: string;
    password: string;
}
