import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { canAccessRoomId } from '../../../authorization/server';
import { Messages, Users } from '../../../models/server';

Meteor.methods({
	async getSingleMessage(msgId) {
		check(msgId, String);

		const uid = Meteor.userId();

		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getSingleMessage' });
		}

		const msg = Messages.findOneById(msgId);

		if (!msg || !msg.rid) {
			return undefined;
		}
		// Ultatel: Send User Object Which Include roles 
		const user = await Users.findOneById(uid);
		if (!canAccessRoomId(msg.rid, user as any)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'getSingleMessage' });
		}

		return msg;
	},
});
