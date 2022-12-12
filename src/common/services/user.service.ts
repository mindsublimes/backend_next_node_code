import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Mapper as MapperToCreate } from '@automapper/types';
import ResponseHelper from '@Helper/response-helper';
import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '@Repository/user.repository';
import ApiResponse from '@Helper/api-response';
import { User } from '@Entities/user.entity';
import { UserDTO } from '@DTO/user-response.dto';

@Injectable()
export class UserService {
  /**
   *  This service is responsible for creating/updating/deleting user information
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
    private readonly usersRepository: UserRepository,
  ) {}

  public async registerUser(
    createUser: UserDTO,
  ): Promise<ApiResponse<UserDTO>> {
    let user = this.mapperToCreateEntity.map(createUser, User, UserDTO);
    let result = await this.usersRepository.create(user);
    if (result.id) {
      let response = new UserDTO();
      response.id = result.id;
      response.email = createUser.email;
      response.region = createUser.region;
      return ResponseHelper.CreateResponse<UserDTO>(
        response,
        HttpStatus.CREATED,
      );
    } else {
      return ResponseHelper.CreateResponse<UserDTO>(
        null,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  public async login(emailAddress: string): Promise<ApiResponse<UserDTO>> {
    const response = await this.usersRepository.getOneByFilter({
      email: emailAddress,
    });
    if (response) {
      const result = this.mapper.map(response, User, UserDTO);
      return ResponseHelper.CreateResponse<UserDTO>(result, HttpStatus.OK);
    }
    return ResponseHelper.CreateResponse<UserDTO>(null, HttpStatus.NOT_FOUND);
  }
}