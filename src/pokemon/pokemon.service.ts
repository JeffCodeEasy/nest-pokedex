import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);

      
    }
  }

  findAll() {
     return this.pokemonModel.find().exec();
  }

  async findOne(id: string) {

      let pokemon: Pokemon | null = null;
      
      if(!isNaN(+id)){
        pokemon = await this.pokemonModel.findOne({no: id});
      }

      
      // MongoID
      if(isValidObjectId(id)){
        pokemon = await this.pokemonModel.findById(id);
      }

      // Name
      if(!pokemon){
        pokemon = await this.pokemonModel.findOne({name: id.toLocaleLowerCase().trim()});
      }

      if(!pokemon) throw new NotFoundException(`Pokemon with id, name or no ${id} not found`);
      
      return pokemon;
      
      
  
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(id); 
    
    if(updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    
    try {
      const updated = await this.pokemonModel.findOneAndUpdate({no : pokemon.no }, updatePokemonDto, { new: true }).exec();
      if (!updated) {
      throw new NotFoundException(`Pokemon con ID ${id} no encontrado`);
    }

    return updated;
    } catch (error) {
      this.handleExceptions(error);
  };

}





  async remove(id: string) {
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount == 0) throw new BadRequestException(`Pokemon with id: "${id}" not found`);

    return;
  }


  private handleExceptions( error: any){
    if(error.code === 11000){
        throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }

}
