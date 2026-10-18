import Ajv from 'ajv';

const ajv = new Ajv({
	coerceTypes: true,
});

export type UserCreateTempParamsPOST = {
	name: string;
    password: string;
	customFields?: object;
	/* @deprecated */
	fields: string;
};

export const userCreateTempParamsPostSchema = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		password: { type: 'string' },
		customFields: { type: 'object' },
		fields: { type: 'string', nullable: true },
	},
	additionalProperties: false,
	required: ['name'],
};

export const isUserCreateTempParamsPOST = ajv.compile<UserCreateTempParamsPOST>(userCreateTempParamsPostSchema);