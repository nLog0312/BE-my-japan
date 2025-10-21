import { Controller, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '@/decorator/customize';
import { AuthDto, LoginDto } from './dto/auth.dto';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { ResponseDto } from '@/helpers/util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiBody({type: LoginDto})
  @ApiOkResponse({ type: ResponseDto })
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @Post('register')
  @HttpCode(200)
  @ApiOkResponse({ type: ResponseDto })
  @Public()
  async register(@Body() registerDto: AuthDto) {
    return await this.authService.register(registerDto);
  }
}
