import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const initialMessage: Message = {
    id: '1',
    content:
      'Xin chào! Tôi là chatbot tư vấn thiệp cưới ONLINE. Tôi có thể giúp bạn tìm hiểu về các gói dịch vụ thiệp cưới của chúng tôi. Bạn có câu hỏi gì không?',
    sender: 'bot',
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getApiKey = () => import.meta.env.VITE_OPENROUTER_API_KEY;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      toast({
        title: 'Thiếu API Key',
        description: 'Bạn cần cấu hình VITE_OPENROUTER_API_KEY trong .env.',
        variant: 'destructive'
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'Wedding Invitation Chatbot'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            {
              role: 'system',
              content: `Bạn là chatbot tư vấn thiệp cưới ONLINE.

Nhiệm vụ: Giải đáp về thiệp cưới online (website thiệp, nhạc nền, RSVP, QR mừng cưới). 
Nếu khách hỏi về thiệp giấy, hãy nhấn mạnh rằng đây là **dịch vụ thiệp cưới online**.

**Bảng giá & tính năng:**
- **Gói Thường (169k):**
  ✔️ Thời gian sử dụng: 6 tháng  
  ✔️ Hỗ trợ thiết kế từ A–Z  
  ✔️ 10 ảnh cưới, thông tin Dâu–Rể  
  ❌ Không có RSVP, không Google Maps

- **Gói Pro (289k):**
  ✔️ 1 năm sử dụng  
  ✔️ 20 ảnh cưới, Google Maps, RSVP  
  ✔️ Tùy chỉnh màu sắc, font chữ  
  ❌ Không loại bỏ quảng cáo, không video

- **Gói VIP (510k):**
  ✔️ Trọn đời  
  ✔️ Không giới hạn ảnh, giao diện VIP  
  ✔️ QR code mừng cưới, video cưới, logo riêng  
  ✔️ Tùy chỉnh bố cục từng phần

- **Gói SVIP (730k):**
  ✔️ Trọn đời + tất cả tính năng VIP  
  ✔️ Gửi thiệp cá nhân hóa có tên riêng từng khách mời 
  ✔️ Dành cho những khách khó tính muốn có tên riêng

**Liên hệ đặt thiệp:**  
- Zalo: 0967021887  
- Website: https://thiepcuoi.pudfoods.com`
            },
            {
              role: 'user',
              content: inputMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const botResponse =
        data.choices?.[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Lỗi kết nối',
        description: 'Không thể kết nối với chatbot. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([initialMessage]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[500px] bg-gradient-to-br from-background to-accent/10">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-soft w-full max-w-[380px] rounded-t-xl">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full gradient-wedding">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Tư vấn thiệp cưới</h1>
              <p className="text-xs text-muted-foreground">Chatbot hỗ trợ 24/7</p>
            </div>
          </div>
          <Button
            onClick={clearMessages}
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Container */}
      <Card
  className="w-full max-w-[380px] flex flex-col shadow-soft rounded-b-xl"
  style={{ height: '500px' }}
>
  {/* Messages scrollable */}
  <div className="flex-1 overflow-y-auto p-3 space-y-2">
    {messages.map(message => (
      <div
        key={message.id}
        className={`flex ${
          message.sender === 'user' ? 'justify-end' : 'justify-start'
        } animate-slide-up`}
      >
        <div
          className={`max-w-[85%] rounded-lg px-3 py-2 ${
            message.sender === 'user'
              ? 'bg-chat-user text-chat-user-foreground ml-2'
              : 'bg-chat-bot text-chat-bot-foreground mr-2 shadow-chat'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          <span className="text-xs opacity-70 mt-1 block">
            {message.timestamp.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    ))}

    {isLoading && (
      <div className="flex justify-start animate-slide-up">
        <div className="bg-chat-bot text-chat-bot-foreground rounded-lg px-4 py-3 mr-4 shadow-chat">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-typing-dots"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-typing-dots"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-typing-dots"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>

  {/* Input Area fixed */}
  <div className="border-t border-border p-3 flex-shrink-0">
    <div className="flex items-center gap-2">
      <Input
        value={inputMessage}
        onChange={e => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Nhập câu hỏi về thiệp cưới..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button
        onClick={sendMessage}
        disabled={isLoading || !inputMessage.trim()}
        className="gradient-wedding hover:opacity-90 transition-opacity"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  </div>
</Card>
    </div>
  );
};

export default ChatBot;