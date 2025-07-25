import { join } from 'path'; // en Node
import { Module } from '@nestjs/common';
import {ServeStaticModule} from '@nestjs/serve-static'
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedModule } from './seed/seed.module';
import { CommonModule } from './common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','public'),
    }),

    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb'),
        dbName: 'pokemonsdb'
      }),
      inject: [ConfigService],
    }),
    
    PokemonModule,
    SeedModule,
    CommonModule,
    
  ],


})
export class AppModule {
  constructor(){}
}
