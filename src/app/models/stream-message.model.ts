import { GPTMessage } from "./gpt-message.model";

export interface StreamOrCompleteMsgResp {
    type: 'textInStream' | 'messageObject';
    textInStream?: string;
    finaleMessageObject?:GPTMessage
}

