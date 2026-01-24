import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import {
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UpdateListingStatusDto,
  ModerationActionDto,
  ResolveReportDto,
  AdminListingsQueryDto,
  AdminUsersQueryDto,
} from './dto';
import { ReportStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // Users
  @Get('users')
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Request() req: any
  ) {
    return this.adminService.updateUserRole(id, dto, req.user.id);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Request() req: any
  ) {
    return this.adminService.updateUserStatus(id, dto, req.user.id);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @Request() req: any) {
    return this.adminService.deleteUser(id, req.user.id);
  }

  // Listings
  @Get('listings')
  getListings(@Query() query: AdminListingsQueryDto) {
    return this.adminService.getListings(query);
  }

  @Get('listings/:type/:id')
  getListing(
    @Param('type') type: 'property' | 'vehicle',
    @Param('id') id: string
  ) {
    return this.adminService.getListing(type, id);
  }

  @Patch('listings/:type/:id/status')
  updateListingStatus(
    @Param('type') type: 'property' | 'vehicle',
    @Param('id') id: string,
    @Body() dto: UpdateListingStatusDto,
    @Request() req: any
  ) {
    return this.adminService.updateListingStatus(type, id, dto, req.user.id);
  }

  @Delete('listings/:type/:id')
  deleteListing(
    @Param('type') type: 'property' | 'vehicle',
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.adminService.deleteListing(type, id, req.user.id);
  }

  // Moderation
  @Get('moderation/pending')
  getPendingListings() {
    return this.adminService.getPendingListings();
  }

  @Post('moderation/:type/:id')
  moderateListing(
    @Param('type') type: 'property' | 'vehicle',
    @Param('id') id: string,
    @Body() dto: ModerationActionDto,
    @Request() req: any
  ) {
    return this.adminService.moderateListing(type, id, dto, req.user.id);
  }

  // Reports
  @Get('reports')
  getReports(@Query('status') status?: ReportStatus) {
    return this.adminService.getReports(status);
  }

  @Patch('reports/:id')
  resolveReport(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @Request() req: any
  ) {
    return this.adminService.resolveReport(id, dto, req.user.id);
  }

  // Admin Logs
  @Get('logs')
  getAdminLogs(@Query('limit') limit?: number) {
    return this.adminService.getAdminLogs(limit);
  }
}
