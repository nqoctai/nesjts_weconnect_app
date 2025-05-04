import { Controller, Post, UseGuards, Req, Get, Res, BadRequestException, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @Public()
  @ResponseMessage('Login successfully')
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Get('profile')
  getProfile(@User() user) {
    return user;
  }

  @Get('/refresh')
  @Public()
  @ResponseMessage("Get User by refresh token")
  handleRefreshToken(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    console.log(req.cookies);
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      // Cookie không còn => coi như refresh_token hết hạn
      throw new BadRequestException('Refresh token đã hết hạn hoặc không tồn tại');
    }
    return this.authService.processNewToken(refreshToken, response);
  }


  @Post('/logout')
  @ResponseMessage("Logout successfully")
  async logout(@Res({ passthrough: true }) response: Response, @User() user) {
    return this.authService.logout(response, user);
  }

  @Post('/register')
  @Public()
  @ResponseMessage("Register successfully")
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }
}
