import { IMessage } from "@rocket.chat/core-typings";

const CustomSystemMessages=[
    'meeting_missed',
    'meeting_ended',
    'meeting_started'
]

export const isCustomSystemMessage = (msg: IMessage): boolean => {
	return CustomSystemMessages.includes(msg.t || '');
};
