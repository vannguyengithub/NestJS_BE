import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job, JobSchema } from './schemas/job.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [JobsController],
  providers: [JobsService],
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])],
})
export class JobsModule {}
