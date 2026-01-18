import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateConversationDto, SendMessageDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Créer une nouvelle conversation' })
  @ApiResponse({ status: 201, description: 'Conversation créée' })
  async createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser('id') userId: string,
  ) {
    const conversation = await this.messagesService.createConversation(dto, userId);
    return {
      success: true,
      message: 'Conversation créée',
      data: conversation,
    };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Récupérer toutes les conversations' })
  @ApiResponse({ status: 200, description: 'Liste des conversations' })
  async getConversations(@CurrentUser('id') userId: string) {
    const conversations = await this.messagesService.getConversations(userId);
    return {
      success: true,
      data: conversations,
    };
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Récupérer une conversation avec ses messages' })
  @ApiResponse({ status: 200, description: 'Conversation trouvée' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async getConversation(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const conversation = await this.messagesService.getConversation(id, userId);
    return {
      success: true,
      data: conversation,
    };
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Envoyer un message dans une conversation' })
  @ApiResponse({ status: 201, description: 'Message envoyé' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    const message = await this.messagesService.sendMessage(conversationId, dto, userId);
    return {
      success: true,
      message: 'Message envoyé',
      data: message,
    };
  }

  @Get('unread')
  @ApiOperation({ summary: 'Compter les messages non lus' })
  @ApiResponse({ status: 200, description: 'Nombre de messages non lus' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const result = await this.messagesService.getUnreadCount(userId);
    return {
      success: true,
      data: result,
    };
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Marquer les messages comme lus' })
  @ApiResponse({ status: 200, description: 'Messages marqués comme lus' })
  async markAsRead(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.messagesService.markAsRead(conversationId, userId);
    return {
      success: true,
      ...result,
    };
  }
}
