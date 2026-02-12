
// Ultatel: Add bulk user update functionality
import type { UsersUpdateParamsPOST } from './UsersUpdateParamsPOST';
import { UsersUpdateParamsPostSchema } from './UsersUpdateParamsPOST';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });

export type UserBulkUpdateParamsPOST = Omit<UsersUpdateParamsPOST, 'userId'> & {
	username: string;
	data: Omit<UsersUpdateParamsPOST['data'],'password'> & {
		extension: string;
		companyPrefix: string;
		companyId: number;
		userId: number;
		avatarUrl: string;
	};
};

const userUpdateBulkPostSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			username: {
				type: 'string',
				nullable: false,
			},
			data: {
				...UsersUpdateParamsPostSchema.properties.data,
				properties: {
					...UsersUpdateParamsPostSchema.properties.data.properties,
					extension: { type: 'string', nullable: false },
					companyPrefix: { type: 'string', nullable: false },
					companyId: { type: 'number', nullable: false },
					userId: { type: 'number', nullable: false },
					avatarUrl: { type: 'string', nullable: false },
				},
			},
		},
		required: ['username', 'data'],
		additionalProperties: false,
	},
};

export const isUsersBulkUpdateParamsPOST = ajv.compile<UserBulkUpdateParamsPOST[]>(userUpdateBulkPostSchema);
