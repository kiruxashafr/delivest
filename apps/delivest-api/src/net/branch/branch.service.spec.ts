import { Test, TestingModule } from '@nestjs/testing';
import { BranchService } from './branch.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { jest } from '@jest/globals';
import { Branch, BranchInfo } from '../../../generated/prisma/client.js';

describe('BranchService', () => {
  let service: BranchService;
  let mockPrisma: any;

  const branchId = '123';

  const mockBranch = {
    id: branchId,
    name: 'Main Branch',
    alias: 'main-branch',
    deletedAt: null,
  };

  const mockInfo = {
    id: 'info_1',
    branchId: branchId,
    address: 'Street 1',
    description: 'Description',
  };

  const mockBranchWithInfo = {
    ...mockBranch,
    info: mockInfo,
  };

  beforeEach(async () => {
    const prismaMock = {
      branch: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      branchInfo: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<BranchService>(BranchService);
    mockPrisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return all active branches', async () => {
      mockPrisma.branch.findMany.mockResolvedValue([mockBranch]);

      const result = await service.findAll();

      expect(mockPrisma.branch.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(branchId);
    });

    it('should return extended dto when extended is true', async () => {
      mockPrisma.branch.findMany.mockResolvedValue([mockBranch]);

      const result = await service.findAll(true);

      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a single branch with info', async () => {
      mockPrisma.branch.findUnique.mockResolvedValue(mockBranchWithInfo);

      const result = await service.findOne(branchId);

      expect(mockPrisma.branch.findUnique).toHaveBeenCalledWith({
        where: { id: branchId },
        include: { info: true },
      });
      expect(result.id).toBe(branchId);
    });
  });

  describe('getBranchDetails', () => {
    it('should return only info record', async () => {
      mockPrisma.branchInfo.findUnique.mockResolvedValue(mockInfo);

      const result = await service.getBranchDetails(branchId);

      expect(mockPrisma.branchInfo.findUnique).toHaveBeenCalledWith({
        where: { branchId: branchId },
      });
      expect(result.address).toBe(mockInfo.address);
    });
  });

  describe('create', () => {
    it('should create branch and empty info record', async () => {
      const createDto = { name: 'New', alias: 'new' };
      mockPrisma.branch.create.mockResolvedValue(mockBranchWithInfo);

      const result = await service.create(createDto);

      expect(mockPrisma.branch.create).toHaveBeenCalledWith({
        data: { ...createDto, info: { create: {} } },
        include: { info: true },
      });
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update branch main fields', async () => {
      const updateDto = { name: 'Updated Name' };
      mockPrisma.branch.update.mockResolvedValue({
        ...mockBranchWithInfo,
        ...updateDto,
      });

      const result = await service.update(branchId, updateDto);

      expect(mockPrisma.branch.update).toHaveBeenCalledWith({
        where: { id: branchId },
        data: updateDto,
        include: { info: true },
      });
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('updateInfo', () => {
    it('should update nested branch info', async () => {
      const infoDto = { address: 'New Address' };
      mockPrisma.branch.update.mockResolvedValue(mockBranchWithInfo);

      await service.updateInfo(branchId, infoDto);

      expect(mockPrisma.branch.update).toHaveBeenCalledWith({
        where: { id: branchId },
        data: {
          info: { update: infoDto },
        },
        include: { info: true },
      });
    });
  });

  describe('softDelete', () => {
    it('should update deletedAt field with current date', async () => {
      mockPrisma.branch.update.mockResolvedValue({
        ...mockBranch,
        deletedAt: new Date(),
      });

      await service.softDelete(branchId);

      expect(mockPrisma.branch.update).toHaveBeenCalledWith({
        where: { id: branchId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
