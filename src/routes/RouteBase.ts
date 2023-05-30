import { AuthenticationException, BadRequestException, ResourceConflictException, ResourceNotFoundException } from "../exceptions/Exception";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export abstract class RouteBase {

    protected async safelyExecuteAsync(respponse: Response, callback: () => Promise<void>) {
        try {
            await callback();
        } catch (err: any) {
            console.error(err);
            if (err instanceof BadRequestException)
                respponse.status(StatusCodes.BAD_REQUEST).send(err.message || "Something went wrong");
            else if (err instanceof ResourceNotFoundException)
                respponse.status(StatusCodes.NOT_FOUND).send(err.message || "Something went wrong");
            else if (err instanceof ResourceConflictException)
                respponse.status(StatusCodes.CONFLICT).send(err.message || "Something went wrong");
            else if (err instanceof AuthenticationException)
                respponse.status(StatusCodes.UNAUTHORIZED).send(err.message || "Something went wrong");
            else
                respponse.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message || "Something went wrong");
        }
    }

}