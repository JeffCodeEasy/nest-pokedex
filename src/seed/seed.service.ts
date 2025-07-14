import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-.response.interface';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class SeedService {
  constructor(
    private readonly httpService: HttpService,
    
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}


  async executeSeed() {

    await this.pokemonModel.deleteMany();

    const {data} = await this.httpService.axiosRef<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    let pokemonToInsert: {name: string, no: number}[] = [];

    data.results.forEach(async ({name, url}) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      
      pokemonToInsert.push({name, no});

    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed Executed';
  }

}
