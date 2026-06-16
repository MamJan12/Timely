import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get my notifications' })
  getMyNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getMyNotifications(
      user.lecturer?.id,
      user.student?.id,
    );
  }

  @Patch(':id/read')
  @Roles(Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }
}
