import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, ThumbsDown, Flag, MessageSquare } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  date: string;
  content: string;
  likes: number;
  dislikes: number;
  replies: Comment[];
}

// Mock data for demo purposes
const mockComments: Comment[] = [
  {
    id: 1,
    author: "Ali Yılmaz",
    date: "2023-09-15T10:30:00",
    content: "Bu makalenin içeriği gerçekten faydalı, forma tasarımı hakkında çok şey öğrendim. Teşekkürler!",
    likes: 12,
    dislikes: 1,
    replies: [
      {
        id: 3,
        author: "FormaYaptırma Takımı",
        date: "2023-09-15T14:45:00",
        content: "Yorumunuz için teşekkür ederiz! Daha fazla içerik için bizi takip etmeye devam edin.",
        likes: 3,
        dislikes: 0,
        replies: []
      }
    ]
  },
  {
    id: 2,
    author: "Mehmet Demir",
    date: "2023-09-14T16:20:00",
    content: "E-spor takımları için forma tasarımı konusunda harika bilgiler. Takımımız için düşündüğümüz tasarımlara yeni bir bakış açısı kazandırdı.",
    likes: 8,
    dislikes: 0,
    replies: []
  }
];

interface BlogCommentSectionProps {
  postId?: number | string;
}

const BlogCommentSection: React.FC<BlogCommentSectionProps> = ({ postId }) => {
  const { language, t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now(),
      author: "Ziyaretçi",
      date: new Date().toISOString(),
      content: newComment,
      likes: 0,
      dislikes: 0,
      replies: []
    };
    
    setComments([comment, ...comments]);
    setNewComment("");
  };
  
  const handleLike = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: comment.likes + 1 };
      }
      return comment;
    }));
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const CommentItem = ({ comment }: { comment: Comment }) => (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=random`}
            alt={comment.author}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">{comment.author}</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">{formatDate(comment.date)}</span>
            </div>
          </div>
          <div className="text-gray-700 dark:text-gray-300 mb-2">
            {comment.content}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button 
              className="flex items-center text-gray-500 hover:text-primary transition-colors"
              onClick={() => handleLike(comment.id)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{comment.likes}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-primary transition-colors">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{t("reply")}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-red-500 transition-colors">
              <Flag className="h-4 w-4 mr-1" />
              <span>{t("report")}</span>
            </button>
          </div>
          
          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
              {comment.replies.map(reply => (
                <div key={reply.id} className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author)}&background=random`}
                        alt={reply.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{reply.author}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">{formatDate(reply.date)}</span>
                        </div>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 mb-2">
                        {reply.content}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <button 
                          className="flex items-center text-gray-500 hover:text-primary transition-colors"
                          onClick={() => handleLike(reply.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{reply.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {comments.length} {t("comments")}
          </h4>
          
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="mb-3">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={language === 'tr' ? 'Yorumunuzu yazın...' : 'Write your comment...'}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={4}
                required
              />
            </div>
            <button 
              type="submit"
              className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {language === 'tr' ? 'Yorum Yap' : 'Post Comment'}
            </button>
          </form>
          
          <Separator className="my-6" />
          
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              {language === 'tr' ? 'Henüz yorum yapılmamış. İlk yorumu yapan siz olun!' : 'No comments yet. Be the first to comment!'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogCommentSection;
