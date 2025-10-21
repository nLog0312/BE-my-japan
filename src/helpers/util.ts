import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

const bcrypt = require('bcrypt');
const saltRounds = 10;

export const hashPasswordHelper = async(plainPassword: string) => {
    try {
        return await bcrypt.hash(plainPassword, saltRounds);
    } catch (error) {
        console.log(error);
    }
}

export const comparePasswordHelper = async(plainPassword: string, hashPassword: string) => {
    try {
        return await bcrypt.compare(plainPassword, hashPassword);
    } catch (error) {
        console.log(error);
    }
}

export const monthRangeISO = (ym: string) => {
    // ym: "YYYY-MM"
    const [yStr, mStr] = ym.split('-');
    const y = Number(yStr), m = Number(mStr);
    if (!y || !m) throw new Error('month cần dạng YYYY-MM');
    const start = `${yStr}-${String(m).padStart(2, '0')}-01`;

    const lastDay = new Date(y, m, 0).getDate();
    const end = `${yStr}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
}

export const yearRangeISO = (yStr: string) => {
    if (!/^\d{4}$/.test(yStr)) throw new Error('year cần dạng YYYY');
    return { start: `${yStr}-01-01`, end: `${yStr}-12-31` };
}

export const dayRangeISO = (day: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('day cần dạng YYYY-MM-DD');

    const d = new Date(day + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);

    const end = d.toISOString().slice(0, 10);
    return { start: day, end: end };
}

export const fromToISO = (from?: string, to?: string) => {
    if (!from || !to) throw new Error('from/to cần dạng YYYY-MM-DD');
    return { start: from, end: to };
}

export class ResponseDto<T = any> {
    @ApiPropertyOptional({ example: 'Request successful' })
    message: string;

    @ApiPropertyOptional({ example: 200 })
    statusCode: number;

    @ApiPropertyOptional()
    @IsOptional()
    data?: T;
}