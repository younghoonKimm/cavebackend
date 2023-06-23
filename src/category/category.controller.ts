import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/auth.guard';
import { CategoryService } from './category.service';
import { Token } from 'src/auth/decorator/auth.decorator';
import { UserInputDto } from 'src/user/dto/user.dto';

@Controller('api/category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async createCategory(
    @Token() user: UserInputDto,
    @Body() categoryInput: any,
  ): Promise<void> {
    return await this.categoryService.createCategory(user);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async getConferences(@Token() user: UserInputDto): Promise<any> {
    return await this.categoryService.getCategories(user);
  }
}
