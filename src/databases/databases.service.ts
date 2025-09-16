import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose/dist/src';
import {
  Permission,
  PermissionDocument,
} from 'src/permissions/schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,

    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,

    private configService: ConfigService,
    private userService: UsersService,
  ) {}

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');

    if (isInit === 'true') {
      const countUser = await this.userModel.count({});
      const countPermission = await this.permissionModel.count({});
      const countRole = await this.roleModel.count({});

      // create permission
      if (countPermission === 0) {
        await this.permissionModel.insertMany(INIT_PERMISSIONS);
      }

      // create role
      if (countRole === 0) {
        const permissions = await this.permissionModel.find({}).select('_id');
        await this.roleModel.insertMany([
          {
            name: ADMIN_ROLE,
            description: 'Admin thì full quyền',
            isActive: true,
            permissions: permissions,
          },
          {
            name: USER_ROLE,
            description: 'Người dùng/Ứng viên sử dụng hệ thống',
            isActive: true,
            permissions: [], // không set quyền chỉ cần add ROLE
          },
        ]);
      }

      // create user
      if (countUser === 0) {
        const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
        const userRole = await this.roleModel.findOne({ name: USER_ROLE });

        await this.userModel.insertMany([
          {
            name: "I'am admin",
            email: 'admin@gmail.com',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD') || '123456',
            ),
            age: 30,
            gender: 'male',
            address: 'Viet Nam',
            role: adminRole?._id,
          },
          {
            name: 'I am user',
            email: 'user@gmail.com',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD') || '123456',
            ),
            age: 30,
            gender: 'male',
            address: 'Viet Nam',
            role: userRole?._id,
          },
          {
            name: 'I am normal user',
            email: 'normal@gmail.com',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD') || '123456',
            ),
            age: 30,
            gender: 'male',
            address: 'Viet Nam',
            role: userRole?._id,
          },
        ]);
      }

      if (countUser > 0 && countRole > 0 && countPermission > 0) {
        console.log('>>> ALREADY INIT SAMPLE DATA');
      } else {
        console.log('>>> SAMPLE DATA INITIALIZATION COMPLETED');
      }
    } else {
      console.log(
        '>>> SHOULD_INIT is not set to true, skipping initialization',
      );
    }
  }

  async syncNewPermissions() {
    try {
      // Get existing permissions
      const existingPermissions = await this.permissionModel.find({});
      const existingPaths = existingPermissions.map(
        (p) => `${p.method}:${p.apiPath}`,
      );

      // Filter new permissions that don't exist yet
      const newPermissions = INIT_PERMISSIONS.filter((permission) => {
        const path = `${permission.method}:${permission.apiPath}`;
        return !existingPaths.includes(path);
      });

      if (newPermissions.length > 0) {
        // Insert new permissions
        await this.permissionModel.insertMany(newPermissions);
        console.log(`>>> Added ${newPermissions.length} new permissions`);

        // Update admin role to include all permissions
        const allPermissions = await this.permissionModel
          .find({})
          .select('_id');
        await this.roleModel.updateOne(
          { name: ADMIN_ROLE },
          { permissions: allPermissions },
        );
        console.log('>>> Updated admin role with new permissions');

        return {
          message: `Successfully added ${newPermissions.length} new permissions and updated admin role`,
          addedPermissions: newPermissions.length,
        };
      } else {
        return {
          message: 'No new permissions to add',
          addedPermissions: 0,
        };
      }
    } catch (error) {
      console.error('Error syncing permissions:', error);
      throw error;
    }
  }
}
