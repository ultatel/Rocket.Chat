import Ajv from 'ajv';

const ajv = new Ajv({
	coerceTypes: true,
});

export type UsersUpdateParamsPOST = {
	userId: string;
	data: {
		email?: string;
		name?: string;
		password?: string;
		username?: string;
		bio?: string;
		nickname?: string;
		statusText?: string;
		active?: boolean;
		roles?: string[];
		joinDefaultChannels?: boolean;
		requirePasswordChange?: boolean;
		setRandomPassword?: boolean;
		sendWelcomeEmail?: boolean;
		verified?: boolean;
		customFields?: Record<string, unknown>;
		status?: string;
		avatarUrl?: string;
	};
	confirmRelinquish?: boolean;
};

const UsersUpdateParamsPostSchema = {
	type: 'object',
	properties: {
		userId: {
			type: 'string',
		},
		confirmRelinquish: {
			type: 'boolean',
		},
		data: {
			type: 'object',
			properties: {
				email: {
					type: 'string',
					nullable: true,
				},
				name: {
					type: 'string',
					nullable: true,
				},
				password: {
					type: 'string',
					nullable: true,
				},
				username: {
					type: 'string',
					nullable: true,
				},
				bio: {
					type: 'string',
					nullable: true,
				},
				nickname: {
					type: 'string',
					nullable: true,
				},
				statusText: {
					type: 'string',
					nullable: true,
				},
				active: {
					type: 'boolean',
					nullable: true,
				},
				roles: {
					type: 'array',
					items: {
						type: 'string',
					},
					nullable: true,
				},
				joinDefaultChannels: {
					type: 'boolean',
					nullable: true,
				},
				requirePasswordChange: {
					type: 'boolean',
					nullable: true,
				},
				setRandomPassword: {
					type: 'boolean',
					nullable: true,
				},
				sendWelcomeEmail: {
					type: 'boolean',
					nullable: true,
				},
				verified: {
					type: 'boolean',
					nullable: true,
				},
				customFields: {
					type: 'object',
					nullable: true,
				},
				status: {
					type: 'string',
					nullable: true,
				},
				avatarUrl: {
					type: 'string',
					nullable: true,
				},
			},
			required: [],
			additionalProperties: false,
		},
	},
	required: ['userId', 'data'],
	additionalProperties: false,
};

export const isUsersUpdateParamsPOST = ajv.compile<UsersUpdateParamsPOST>(UsersUpdateParamsPostSchema);

// Ultatel: Added Type (will move to new file later)

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
