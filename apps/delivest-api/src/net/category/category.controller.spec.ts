/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';
import { jest } from '@jest/globals';
import { GetCategoryDto } from './dto/get-category.dto.js';
import { ReadCategoryDto } from './dto/read-category.dto.js';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: jest.Mocked<CategoryService>;

  const mockCategoryService = {
    findAllByBranch: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDto: GetCategoryDto = { id: '123' };
  const mockResult: ReadCategoryDto = {
    id: '123',
    name: 'Пицца',
    order: 1,
  } as ReadCategoryDto;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService) as jest.Mocked<CategoryService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCtaegory', () => {
    it('should call service.findAllByBranch and return results', async () => {
      const mockResults = [mockResult];
      service.findAllByBranch.mockResolvedValue(mockResults);

      const result = await controller.getAllCtaegory(mockDto);

      expect(service.findAllByBranch).toHaveBeenCalledWith(mockDto.id);
      expect(service.findAllByBranch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResults);
    });
  });

  describe('getCategory', () => {
    it('should call service.findOne and return category', async () => {
      service.findOne.mockResolvedValue(mockResult);

      const result = await controller.getCategory(mockDto);

      expect(service.findOne).toHaveBeenCalledWith(mockDto.id);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });
});
