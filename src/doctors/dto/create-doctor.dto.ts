export class CreateDoctorDto {
  username: string;
  password: string;
  name: string;
  description?: string;
  //   image: Binary;
  phone_number: string;
  salary: number;
  //   specialty: string;
  //   certification: Binary;
  working_hours?: string;
}
