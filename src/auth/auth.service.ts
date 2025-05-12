import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as ms from 'ms';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { IUser } from 'src/modules/users/user.interface';
import { UsersService } from 'src/modules/users/users.service';
import { comparePassword } from 'src/utils/brypt';


@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService, private configService: ConfigService) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUserName(username);
        if (user) {

            const isMatch = comparePassword(pass, user.password);
            if (!isMatch) {
                throw new Error('Password is incorrect');
            }
            const { password, ...result } = user;
            console.log("result", result)
            return result;
        }
        return null;
    }


    createRefreshTOken = (payload) => {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE')
        })
        return refresh_token;
    }

    async login(user: any, response: Response) {
        console.log("user", user);
        const { id, name, email } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            id,
            name,
            email

        };

        const refresh_token = this.createRefreshTOken(payload);

        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE') as ms.StringValue || '1d'),

        })

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id,
                name,
                email
            }
        };
    }

    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            const decodedToken = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
            })
            const { email } = decodedToken as unknown as IUser;


            let user = await this.usersService.findOneByUserName(email);
            if (user) {
                // update new refresh token
                const { id, name, email } = user;
                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    id,
                    name,
                    email,
                };

                const refresh_token = this.createRefreshTOken(payload);
                response.clearCookie('refresh_token');
                response.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE') as ms.StringValue)
                })

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        id,
                        name,
                        email,
                    }

                };
            } else {
                throw new BadRequestException("Refresh Token không hợp lệ. Vui lòng login");
            }
        } catch (error) {

            if (error.name === 'TokenExpiredError') {
                throw new BadRequestException('Refresh token đã hết hạn');
            } else {
                throw new BadRequestException('Refresh token không hợp lệ');
            }
        }
    }

    logout = (response: Response, user: any) => {
        const { id, name, email } = user;
        const userDB = this.usersService.findOneByUserName(email);
        if (!userDB) {
            throw new BadRequestException('User not found');
        }
        response.clearCookie('refresh_token');
        return {
            message: "Logout successfully"
        }
    }

    register = async (registerDto: CreateUserDto) => {
        const user = await this.usersService.create(registerDto);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        };
    }

    async handleVerifyToken(token) {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
            });
            return payload;
        } catch (error) {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED)
        }
    }

}
