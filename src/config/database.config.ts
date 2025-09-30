import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const databaseConfig = (configService: ConfigService): SequelizeModuleOptions => ({
  dialect: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', '1234'),
  database: configService.get<string>('DB_NAME', 'test'),
  autoLoadModels: true,
  synchronize: true,
  logging: false,
});