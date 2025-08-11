import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '../utils/emailService';
import { generateVerificationCode } from '../utils/helpers';

const prisma = new PrismaClient();

// Define valid time units for JWT expiresIn
type JwtTimeUnit = 's' | 'm' | 'h' | 'd' | 'w' | 'y';
type JwtTimeString = `${number}${JwtTimeUnit}` | `${number}${JwtTimeUnit}${number}${JwtTimeUnit}`;

export class AuthService {
  static async register(userData: {
    email: string;
    phoneNumber: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const { email, phoneNumber, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }]
      }
    });

    if (existingUser) {
      throw new Error('User already exists with this email or phone number');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification code and expiry
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber,
        password: hashedPassword,
        firstName,
        lastName,
        verificationCode,
        verificationCodeExpiry,
        role: 'STUDENT'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        emailVerified: true,
        onboardingDone: true,
        role: true
      }
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return user;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        onboardingDone: true,
        role: true,
        selectedSubjects: true,
        goalScore: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRE_ENV = process.env.JWT_EXPIRE;

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    // Helper function to parse expire string or number to valid jwt expiresIn type
    function parseExpire(expire?: string): number | JwtTimeString | undefined {
      const defaultExpire: JwtTimeString = '7d';

      if (!expire) return defaultExpire;

      const regex = /^(\d+)([smhdwy])$/;
      const match = expire.match(regex);

      if (match) {
        const timeString = match[0] as JwtTimeString; // Full match (e.g., '7d')
        return timeString;
      }

      const num = Number(expire);
      if (!isNaN(num) && num > 0) {
        return num; // Valid number in seconds
      }

      return defaultExpire; // Fallback to default
    }
    const JWT_EXPIRE = parseExpire(JWT_EXPIRE_ENV);

    const signOptions: SignOptions = {
      // @ts-ignore
      expiresIn: JWT_EXPIRE,
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET!,
      signOptions
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  static async verifyEmail(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    if (user.verificationCode !== code) {
      throw new Error('Invalid verification code');
    }

    if (!user.verificationCodeExpiry || user.verificationCodeExpiry < new Date()) {
      throw new Error('Verification code has expired');
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null
      }
    });

    return { message: 'Email verified successfully' };
  }

  static async resendVerificationCode(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationCodeExpiry }
    });

    await sendVerificationEmail(email, verificationCode);

    return { message: 'Verification code sent successfully' };
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    // TODO: send reset email logic here
    // await sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset email sent' };
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not defined');
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (
        !user ||
        user.resetToken !== token ||
        !user.resetTokenExpiry ||
        user.resetTokenExpiry < new Date()
      ) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return { message: 'Password reset successfully' };
    } catch {
      throw new Error('Invalid or expired reset token');
    }
  }
}