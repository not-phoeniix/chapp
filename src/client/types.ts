import { Dispatch, SetStateAction } from "react";

export enum CacheKeys {
    OPEN_CHANNEL_INDEX = "chappOpenChannelIndex",
    CHANNELS = "chappChannels",
    USERNAME = "chappUsername",
};

export interface Variable<T> {
    value: T;
    set: Dispatch<SetStateAction<T>>
};
