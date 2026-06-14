import { prisma } from "../prisma/client";
import { CreateUserDto } from "../dtos/create-user.dto";
import { LoginDto } from "../dtos/login.dto";

import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";

import { AppError } from "../errors/AppError";

export class AuthService {
    async register(data: CreateUserDto) {
        const { name, email, password } = data;

        if (!name || !email || !password) {
            throw new AppError("All fields are required", 400);
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            throw new AppError("Email already registered", 409);
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        const token = generateToken(user.id);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        };
    }

    async login(data: LoginDto) {
        const { login, password } = data;

        if (!login || !password) {
            throw new AppError("Login and password are required", 400);
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                { email: login },
                { name: login }
                ]
            }
        });

        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        const passwordValid = await comparePassword(
            password,
            user.passwordHash
        );

        if (!passwordValid) {
            throw new AppError("Invalid credentials", 401);
        }

        const token = generateToken(user.id);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        };
    }
}


export const authService = new AuthService();