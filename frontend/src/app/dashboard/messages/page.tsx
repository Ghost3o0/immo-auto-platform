'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, ArrowLeft, MessageCircle, Home, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useUnreadMessages } from '@/hooks';
import { messagesApi } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';

interface Conversation {
  id: string;
  buyer: { id: string; name: string; avatar?: string; email?: string };
  seller: { id: string; name: string; avatar?: string; email?: string };
  property?: { id: string; title: string; images: any[] };
  vehicle?: { id: string; title: string; images: any[] };
  lastMessage?: { content: string; createdAt: string };
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}

interface ConversationDetail {
  id: string;
  buyer: { id: string; name: string; avatar?: string; email: string };
  seller: { id: string; name: string; avatar?: string; email: string };
  property?: { id: string; title: string; price: number; images: any[] };
  vehicle?: { id: string; title: string; price: number; images: any[] };
  messages: Message[];
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { unreadCount, refetch: refetchUnreadCount } = useUnreadMessages({ enabled: isAuthenticated });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      loadConversation(conversationId);
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await messagesApi.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await messagesApi.getConversation(id);
      setSelectedConversation(response.data);
      // Update URL
      router.push(`/dashboard/messages?conversation=${id}`, { scroll: false });
      // Refresh conversations to update unread count
      loadConversations();
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    try {
      setIsSending(true);
      const response = await messagesApi.sendMessage(selectedConversation.id, newMessage);
      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, response.data],
      });
      setNewMessage('');
      loadConversations();
      // Rafraîchir le compteur de messages non lus
      refetchUnreadCount();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (conv: Conversation | ConversationDetail) => {
    return conv.buyer.id === user?.id ? conv.seller : conv.buyer;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="h-[600px] rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Gérez vos conversations avec les acheteurs et vendeurs</p>
      </div>

      <div className="grid h-[calc(100vh-250px)] min-h-[500px] gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className={cn('lg:col-span-1', selectedConversation && 'hidden lg:block')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingConversations ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex animate-pulse gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Aucune conversation</p>
                <p className="text-sm">Contactez un vendeur pour démarrer</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const listing = conv.property || conv.vehicle;
                  const isProperty = !!conv.property;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className={cn(
                        'flex w-full items-start gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50',
                        selectedConversation?.id === conv.id && 'bg-muted'
                      )}
                    >
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {getInitials(other.name)}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{other.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(conv.updatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {isProperty ? (
                            <Home className="h-3 w-3" />
                          ) : (
                            <Car className="h-3 w-3" />
                          )}
                          <span className="truncate">{listing?.title}</span>
                        </div>
                        {conv.lastMessage && (
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className={cn('lg:col-span-2', !selectedConversation && 'hidden lg:flex lg:items-center lg:justify-center')}>
          {selectedConversation ? (
            <div className="flex h-full flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {getInitials(getOtherParticipant(selectedConversation).name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{getOtherParticipant(selectedConversation).name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getOtherParticipant(selectedConversation).email}
                    </p>
                  </div>
                  {(selectedConversation.property || selectedConversation.vehicle) && (
                    <a
                      href={selectedConversation.property
                        ? `/properties/${selectedConversation.property.id}`
                        : `/vehicles/${selectedConversation.vehicle!.id}`
                      }
                      className="hidden items-center gap-2 rounded-lg border bg-muted/50 p-2 text-sm hover:bg-muted sm:flex"
                    >
                      {selectedConversation.property ? (
                        <Home className="h-4 w-4" />
                      ) : (
                        <Car className="h-4 w-4" />
                      )}
                      <span className="max-w-[150px] truncate">
                        {selectedConversation.property?.title || selectedConversation.vehicle?.title}
                      </span>
                    </a>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                {isLoadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Chargement...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => {
                      const isMe = message.sender.id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[70%] rounded-lg px-4 py-2',
                              isMe
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <p
                              className={cn(
                                'mt-1 text-xs',
                                isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              )}
                            >
                              {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || isSending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <MessageCircle className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p>Choisissez une conversation dans la liste pour afficher les messages</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
