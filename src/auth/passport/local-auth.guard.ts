import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    handleRequest(err: any, user: any, info: any) {
        // passport-local trả info?.message === 'Missing credentials' khi thiếu username/password
        if (info?.message === 'Missing credentials') {
            throw new BadRequestException('Tài khoản và mật khẩu là bắt buộc');
        }
        if (err || !user) {
            return null;
        }
        return user ?? null;
    }
}