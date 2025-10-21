
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'user_name',
            passwordField: 'password',
        });
    }

    async validate(user_name: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(user_name, password);

        return user ?? null;
    }
}
