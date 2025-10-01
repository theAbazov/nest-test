import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { User } from '../modules/users/user.entity';
import { Todo } from '../modules/todos/todo.entity';
import { File } from '../modules/files/file.entity';

export const databaseConfig = (configService: ConfigService): SequelizeModuleOptions => {
  const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  return {
    dialect: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME', 'todo_app'),
    models: [User, Todo, File],
    autoLoadModels: true,
    synchronize: isDevelopment, // Only sync in development
    logging: isDevelopment ? console.log : false,
    pool: {
      max: configService.get<number>('DB_POOL_MAX', 10),
      min: configService.get<number>('DB_POOL_MIN', 2),
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: isProduction ? {
      ssl: {
        require: false,
        rejectUnauthorized: false,
      },
    } : {},
    // Retry configuration for Docker environments
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },
  };
};