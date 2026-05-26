import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  private generateToken(user: any, role: UserRole) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: role,
      tv: user.token_version,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        full_name: user.full_name,
        role: role,
      },
    };
  }

  
  async createAdmin() {
    const existingAdmin = await this.userRepository.findOne({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (existingAdmin) {
      return {
        message: 'Admin already exists',
      };
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = this.userRepository.create({
      full_name: 'System Admin',
      username: 'admin',
      phone: '0000000000',
      password: hashedPassword,
      role: UserRole.ADMIN,
      is_verified: true,
    });

    await this.userRepository.save(admin);

    return {
      message: 'Admin created successfully',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    user.token_version += 1;
     await this.userRepository.save(user);
    return this.generateToken(user, user.role);
    
  }




}