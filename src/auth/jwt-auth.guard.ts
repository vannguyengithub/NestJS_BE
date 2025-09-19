import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_PERMISSION, IS_PUBLIC_KEY } from 'src/decorator/customize';

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
    console.log('<<isPublic>>', isPublic);
    // Always try to authenticate, but for public routes we'll handle missing auth in handleRequest
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

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isSkipCheckPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PERMISSION,
      [context.getHandler(), context.getClass()],
    );

    // For public endpoints, allow access without authentication
    if (isPublic) {
      // If there's a valid user (token provided and valid), return it
      // If no token or invalid token, return null but don't throw error
      if (err || !user) {
        return null as TUser; // Allow public access without authentication
      }
      return user as TUser; // Return authenticated user for public endpoint
    }

    // For private endpoints, require authentication
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException('Token is invalid or token not found Bearer')
      );
    }

    // Type assertion to ensure user conforms to IUser interface
    const typedUser = user as IUser;

    // check permission
    const targetMethod = request.method;
    const targetEndpoint = request.route?.path as string;
    const permissions = typedUser.permissions ?? [];

    let isExist = permissions.find(
      (permission) =>
        targetMethod === permission.method &&
        targetEndpoint === permission.apiPath,
    );

    if (targetEndpoint?.startsWith('/api/v1/auth'))
      isExist = true as unknown as Permission;

    if (!isExist && !isSkipCheckPermission) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào endpoint này',
      );
    }

    return typedUser as TUser;
  }
}
