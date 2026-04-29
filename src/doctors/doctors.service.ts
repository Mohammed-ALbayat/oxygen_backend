import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const { specialty_id, password, ...doctorData } = createDoctorDto;

    // تشفير الباسورد
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const doctor = this.doctorRepository.create({
        ...doctorData,
        password: hashedPassword,
        specialty: { id: specialty_id },
      });

      const savedDoctor = await this.doctorRepository.save(doctor);

      // استخدام الـ Destructuring لاستثناء الباسورد
      const { password: _, ...result } = savedDoctor;

      // بما أننا نستخدم Interceptor، نرجع الكائن بهذا الشكل
      return {
        message: 'تم إنشاء حساب الطبيب بنجاح',
        data: result,
      };
    } catch (error: any) {
      // 1062 هو كود الخطأ لتكرار البيانات في MariaDB/MySQL
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new ConflictException('اسم المستخدم أو رقم الهاتف مسجل مسبقاً');
      }
      throw error;
    }
}









  async findAll() {
    return this.doctorRepository.find({
      where: {
        published: true,
      },
    });
  }

  async findOne(id: number) {
    return this.doctorRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async findByUsername(username: string) {
    return this.doctorRepository.findOne({
      where: {
        username: username,
      },
    });
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    return this.doctorRepository.update({ id: id }, updateDoctorDto);
  }

  async remove(id: number) {
    return this.doctorRepository.delete({ id: id });
  }
}
