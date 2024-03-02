import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async createCategory(
    @Token() user: UserInputDto,
    @Body() categoryInput: any,
  ): Promise<void> {
    // 카테고리 이름, 인풋,
    console.log(categoryInput);

    return await this.categoryService.createCategory(user);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async getCategories(@Token() user: UserInputDto): Promise<any> {
    return await this.categoryService.getCategories(user);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AccessTokenGuard)
  async getCategory(
    @Token() user: UserInputDto,
    @Param() { id: categoryId },
  ): Promise<any> {
    return await this.categoryService.getCategory(categoryId);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AccessTokenGuard)
  async updateCategory(
    // @Token() user: UserInputDto,
    @Param() { id: categoryId },
    @Body() categoryInput: any,
  ): Promise<any> {
    return await this.categoryService.patchCategory(categoryId, categoryInput);
  }
}
