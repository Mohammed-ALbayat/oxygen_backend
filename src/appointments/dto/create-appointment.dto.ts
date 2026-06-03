import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAppointmentDto {
    @IsNumber()
    @IsNotEmpty()
    doctor_id: number;
    @IsDateString()
    @IsNotEmpty()
    appointment_date: Date;
    @IsString()
    @IsNotEmpty()
    start_time: string;
    @IsString()
    @IsNotEmpty()
    end_time: string;
    @IsNumber()
    @IsNotEmpty()
    department_id: number;
}
