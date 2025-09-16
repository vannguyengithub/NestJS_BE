import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose/dist/src';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const { name, email, skills } = createSubscriberDto;
    const isExist = await this.subscriberModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(
        'Subscriber với email: ' + email + ' đã tồn tại',
      );
    }

    const newSubscriber = await this.subscriberModel.create({
      name,
      email,
      skills,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: newSubscriber._id,
      createdAt: newSubscriber.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-expect-error: Unreachable code error
      .sort(sort)
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
      throw new BadRequestException('Not found subscriber with id: ' + id);
    }

    return this.subscriberModel.findById(id);
  }

  async update(
    id: string,
    updateSubscriberDto: UpdateSubscriberDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Not found subscriber with id: ' + id);
    }

    const updated = await this.subscriberModel.updateOne(
      { _id: id },
      {
        ...updateSubscriberDto,
        updatedBy: { _id: user._id, email: user.email },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Not found subscriber with id: ' + id);
    }

    await this.subscriberModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.subscriberModel.softDelete({ _id: id });
  }
}
