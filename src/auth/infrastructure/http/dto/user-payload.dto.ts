import { IsString } from "class-validator";

export class UserLoginPayloadDto {

    @IsString()
    username!: string;

    @IsString()
    password!: string;
}