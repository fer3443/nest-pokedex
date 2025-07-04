import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    if (!term) {
      throw new BadRequestException(
        'El termino de busqueda no puede estar vacio'
      )
    }
    const query: { name?: string; no?: string } = isNaN(+term) ? { name: term.toLocaleLowerCase().trim() } : { no: term };
    const pokemon = (await this.pokemonModel.findOne(query)) || (isValidObjectId(term) ? await this.pokemonModel.findById(term) : null);
    if (!pokemon) {
      throw new NotFoundException(`El pokemon con id, nombre o no "${term}" no se encontró`)
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true })

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    //  const pokemon = await this.findOne(id);
    //  await pokemon.deleteOne(); No uso las dos funciones (59 y 60) porque hago doble consulta a la db
    // const result = await this.pokemonModel.findByIdAndDelete(id) no valida que exista el pokemon en la db por eso no me sirve
    const {deletedCount} = await this.pokemonModel.deleteOne({ _id: id })
    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon with id "${id}" not found`)
    }
    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exist in db ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error)
    throw new InternalServerErrorException(`Can't create/update Pokemon - Check server logs`)
  }
}
