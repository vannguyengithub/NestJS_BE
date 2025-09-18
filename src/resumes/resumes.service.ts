import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { IUser } from 'src/users/users.interface';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose/dist/src';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { url, companyId, jobId } = createUserCvDto;
    const { email, _id } = user;

    const newCv = await this.resumeModel.create({
      url,
      companyId,
      email,
      jobId,
      userId: _id,
      status: 'PENDING',
      createdBy: {
        _id,
        email,
      },
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      ],
    });

    return {
      _id: newCv._id,
      createdAt: newCv.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    // Apply company filter for HR role
    if (user.role.name === 'HR' && user.company && user.company._id) {
      const companyId = user.company._id.toString();
      filter.companyId = companyId;
    }

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-expect-error: Unreachable code error
      .sort(sort)
      .populate(population)
      .select(projection)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Not found resume with id: ' + id);
    }

    return this.resumeModel.findById(id);
  }

  async findByUsers(user: IUser) {
    return await this.resumeModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: 'companyId',
          select: { name: 1 },
        },
        {
          path: 'jobId',
          select: { name: 1 },
        },
      ]);
  }

  async update(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Not found resume with id: ' + id);
    }

    const updated = await this.resumeModel.updateOne(
      { _id: id },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        $push: {
          history: {
            status: status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.resumeModel.softDelete({ _id: id });
  }
}
