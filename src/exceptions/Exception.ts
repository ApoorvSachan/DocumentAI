export class AuthenticationException extends Error{
    constructor(msg?: string){
        super(msg);
    }
}

export class BadRequestException extends Error{
    constructor(msg: string){
        super(msg);
    }
}

export class ResourceConflictException extends Error{
    constructor(resourceType: string, fieldName: string, fieldValue: string){
        super(`Conflicting entries for ${resourceType} with ${fieldName} = ${fieldValue}`);
    }
}

export class ResourceNotFoundException extends Error{
    constructor(resourceType: string, resourceId: string){
        super(`Missing ${resourceType} with id: ${resourceId}`);
    }
}