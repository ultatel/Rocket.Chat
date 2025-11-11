import type { IMessage, IUser } from '@rocket.chat/core-typings';

import { Users } from '../../../models/server';
import { settings } from '../../../settings/server';

const filterStarred = (message: IMessage, uid: string): IMessage => {
	// only return starred field if user has it starred
	if (message.starred && Array.isArray(message.starred)) {
		message.starred = message.starred.filter((star) => star._id === uid);
	}
	return message;
};

// TODO: we should let clients get user names on demand instead of doing this
// Ultatel: optimize user name retrieval
function getNameOfUsername(users: Map<string, { name: string; customFields: any }>, username: string): string {
	return users.get(username)?.name || username;
}

// Ultatel: optimize message normalization for user
export const normalizeMessagesForUser = (messages: IMessage[], uid: string, loadUserCustomFields: boolean = false): IMessage[] => {
	// if not using real names, there is nothing else to do
	if (!settings.get('UI_Use_Real_Name')) {
		return messages.map((message) => filterStarred(message, uid));
	}

	const usernames = new Set();

	messages.forEach((message) => {
		message = filterStarred(message, uid);

		if (!message.u || !message.u.username) {
			return;
		}
		usernames.add(message.u.username);

		(message.mentions || []).forEach(({ username }) => {
			usernames.add(username);
		});

		Object.values(message.reactions || {}).forEach((reaction) => reaction.usernames.forEach((username) => usernames.add(username)));
	});

	const names = new Map();

	(
		Users.findUsersByUsernames([...usernames.values()], {
			fields: {
				username: 1,
				name: 1,
				customFields: 1,
			},
		}) as Pick<IUser, 'username' | 'name' | 'customFields'>[]
	).forEach((user) => {
		names.set(user.username, { name: user.name, customFields: user.customFields });
	});

	// Ultatel: transfer for each to map
	return messages.map((message: IMessage) => {
		if (!message.u) {
			return message;
		}

		if (names.has(message.u.username)) message.u.name = getNameOfUsername(names, message.u.username);
		if (loadUserCustomFields) {
			message.u.customFields = names.get(message.u.username)?.customFields;
		}

		(message.mentions || []).forEach((mention) => {
			if (mention.username) {
				mention.name = getNameOfUsername(names, mention.username);
			}
		});

		if (!message.reactions) {
			return message;
		}

		message.reactions = Object.fromEntries(
			Object.entries(message.reactions).map(([keys, reaction]) => {
				reaction.names = reaction.usernames.map((username) => getNameOfUsername(names, username));
				return [keys, reaction];
			}),
		);
		return message;
	});
};
