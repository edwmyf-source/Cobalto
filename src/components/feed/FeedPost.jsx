import { useState } from 'react';
import UserAvatar from '../shared/UserAvatar';  
import ReactionBar from './ReactionBar';
import CommentSection from './CommentSection';

export default function FeedPost({ post }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
      <div className="flex items-center mb-4">
        <UserAvatar user={post.author} />
        <div className="ml-2">
          <div className="font-semibold text-gray-800">{post.author.fullName}</div>
          <div className="text-sm text-gray-500">
            {post.category} • {post.subcategory} • {post.location}  
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
      <p className="text-gray-700 mb-4">{post.content}</p>

      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          {post.images.map((image, index) => (
            <img key={index} src={image} alt={`Image ${index}`} className="rounded-2xl mb-2" /> 
          ))}
        </div>
      )}

      {post.price && (
        <div className="text-lg text-green-600 mb-4">${post.price}</div>
      )}

      <ReactionBar 
        postId={post.id}
        initialLikesCount={post.likesCount}
        initialUserReaction={post.userReaction}
      />

      <button
        onClick={() => setShowComments(!showComments)} 
        className="text-sm text-gray-500 mt-2"
      >
        {showComments ? 'Hide' : 'Show'} Comments ({post.commentsCount})
      </button>

      {showComments && (
        <CommentSection postId={post.id} /> 
      )}

    </div>
  );
}
