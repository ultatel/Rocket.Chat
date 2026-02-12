// Ultatel: Add bulk user create functionality
import Ajv from 'ajv';
import type { UserCreateParamsPOST } from './UserCreateParamsPOST';
import {  userCreateParamsPostSchema } from './UserCreateParamsPOST';

const ajv = new Ajv({
    coerceTypes: true,
});

export type UserBulkCreateParamsPOST = UserCreateParamsPOST & {
    extension: string;
    companyPrefix: string;
    companyId: number;
    userId: number;
    avatarUrl: string;
};


const userCreateBulkPostSchema = {
    type: 'array',
    items: {
        ...userCreateParamsPostSchema,
        properties: {
            ...userCreateParamsPostSchema.properties,
            extension: { type: 'string', nullable: false },
            companyPrefix: { type: 'string', nullable: false },
            companyId: { type: 'number', nullable: false },
            userId: { type: 'number', nullable: false },
            avatarUrl: { type: 'string', nullable: false },
        }
    },
};

export const isUserCreateParamsPOSTBulk = ajv.compile<UserBulkCreateParamsPOST[]>(userCreateBulkPostSchema);