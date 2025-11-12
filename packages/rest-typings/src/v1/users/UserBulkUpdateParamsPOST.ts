
// Ultatel: Add bulk user update functionality
import type { UsersUpdateParamsPOST } from './UsersUpdateParamsPOST';
import { UsersUpdateParamsPostSchema } from './UsersUpdateParamsPOST';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });

export type UserBulkUpdateParamsPOST = Omit<UsersUpdateParamsPOST, 'userId'> & {
	username: string;
	data: UsersUpdateParamsPOST['data'] & {
		extension: string;
		companyPrefix: string;
		companyId: number;
		userId: number;
	};
};

const userUpdateBulkPostSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			username: {
				type: 'string',
			},
			data: {
				...UsersUpdateParamsPostSchema.properties.data,
				properties: {
					...UsersUpdateParamsPostSchema.properties.data.properties,
					extension: { type: 'string', nullable: false },
					companyPrefix: { type: 'string', nullable: false },
					companyId: { type: 'number', nullable: false },
					userId: { type: 'number', nullable: false },
				},
			},
		},
		required: ['username', 'data'],
		additionalProperties: false,
	},
};

export const isUsersBulkUpdateParamsPOST = ajv.compile<UserBulkUpdateParamsPOST[]>(userUpdateBulkPostSchema);
