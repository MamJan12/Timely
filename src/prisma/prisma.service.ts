<<<<<<< HEAD
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
=======
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@app/generated/generated/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly slowQueryThresholdMs: number;

  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get<string>('database.url'),
      max: configService.get<number>('database.poolSize'),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    super({ adapter });

    this.slowQueryThresholdMs =
      configService.get<number>('database.slowQueryThresholdMs') ?? 100;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log(
      `Database connected (slow-query threshold: ${this.slowQueryThresholdMs}ms)`,
    );
>>>>>>> 01baa886891db1263d9ee5b1ee826fbf9abdf4b9
  }

  async onModuleDestroy() {
    await this.$disconnect();
<<<<<<< HEAD
=======
    this.logger.log('Database disconnected');
>>>>>>> 01baa886891db1263d9ee5b1ee826fbf9abdf4b9
  }
}
