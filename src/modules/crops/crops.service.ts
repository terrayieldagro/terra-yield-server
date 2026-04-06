import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CropsService {
  constructor(private prisma: PrismaService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'terra-yield/crops',
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result.secure_url);
          },
        )
        .end(file.buffer);
    });
  }

  private extractPublicId(imageUrl: string): string {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    return `terra-yield/crops/${filename}`;
  }

  async create(adminId: string, dto: CreateCropDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Crop image is required');
    }

    const imageUrl = await this.uploadImage(file);

    try {
      const crop = await this.prisma.crop.create({
        data: {
          ...dto,
          imageUrl,
          adminId,
        },
      });

      return crop;
    } catch (error) {
      const publicId = this.extractPublicId(imageUrl);
      await cloudinary.uploader.destroy(publicId);
      throw error;
    }
  }

  async findAll(status: string) {
    return this.prisma.crop.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const crop = await this.prisma.crop.findUnique({
      where: { id },
    });

    if (!crop) {
      throw new NotFoundException(`Crop not found`);
    }

    return crop;
  }

  async update(
    id: string,
    adminId: string,
    dto: UpdateCropDto,
    file?: Express.Multer.File,
  ) {
    const crop = await this.findOne(id);

    if (crop.adminId !== adminId) {
      throw new NotFoundException(`Crop not found`);
    }

    let imageUrl = crop.imageUrl;

    if (file) {
      const publicId = this.extractPublicId(crop.imageUrl);
      await cloudinary.uploader.destroy(publicId);

      imageUrl = await this.uploadImage(file);
    }

    return this.prisma.crop.update({
      where: { id },
      data: { ...dto, imageUrl },
    });
  }

  async remove(id: string, adminId: string) {
    const crop = await this.findOne(id);

    if (crop.adminId !== adminId) {
      throw new NotFoundException(`Crop not found`);
    }

    const publicId = this.extractPublicId(crop.imageUrl);
    await cloudinary.uploader.destroy(publicId);

    await this.prisma.crop.delete({ where: { id } });

    return { message: 'Crop deleted successfully' };
  }
}
