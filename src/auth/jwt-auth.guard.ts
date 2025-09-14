import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';
import { Request } from 'express';

interface RequestWithRoute extends Request {
  route: {
    path?: string;
  };
}
import { IUser } from 'src/users/users.interface';

interface Permission {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser = IUser>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    console.log('<<info>>', info);
    const request: RequestWithRoute = context.switchToHttp().getRequest();

    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException('Token is invalid or token not found Bearer')
      );
    }

    // Type assertion to ensure user conforms to IUser interface
    const typedUser = user as IUser;

    // check permission
    const targetMethod: string = request.method;
    const targetEndpoint: string | undefined = request.route?.path;
    const permissions: Permission[] = typedUser.permissions ?? [];

    const isExist = permissions.find(
      (permission) =>
        targetMethod === permission.method &&
        targetEndpoint === permission.apiPath,
    );

    if (!isExist) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào endpoint này',
      );
    }

    return typedUser as TUser;
  }
}
