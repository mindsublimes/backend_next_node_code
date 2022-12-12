import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '@Services/user.service';
import ApiResponse from '@Helper/api-response';
import { UserDTO } from '@DTO/user-response.dto';
import { BaseDTO } from '@DTO/base.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/validate')
  async validateUser(
    @Query('email') email: string,
  ): Promise<ApiResponse<UserDTO>> {
    return await this.userService.login(email);
  }

  @Post('/register')
  async register(@Body() user: UserDTO): Promise<ApiResponse<BaseDTO>> {
    return await this.userService.registerUser(user);
  }
}