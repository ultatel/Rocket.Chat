import Ajv from 'ajv';
import { UserCreateParamsPOST, userCreateParamsPostSchema } from "@rocket.chat/rest-typings/src/v1/users";

const ajv = new Ajv({
    coerceTypes: true,
});

export type UserBulkCreateParamsPOST = UserCreateParamsPOST & {
    extension: string;
    companyPrefix: string;
    companyId: number;
    userId: number;
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
        }
    },
};

export const isUserCreateParamsPOSTBulk = ajv.compile<UserBulkCreateParamsPOST[]>(userCreateBulkPostSchema);