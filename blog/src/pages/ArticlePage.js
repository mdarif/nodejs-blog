import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import articles from './article-content';
import NotFoundPage from './NotFoundPage';
import CommentsList from '../components/CommentsList';
import AddCommentForm from '../components/AddCommentForm';
import useUser from '../hooks/useUser';
import axios from 'axios';

const ArticlePage = () => {
  const [articleInfo, setArticleInfo] = useState({
    upvotes: 0,
    comments: [],
    canUpvote: false,
  });
  const { canUpvote } = articleInfo;
  const { articleId } = useParams();
  const { user, isLoading } = useUser();

  console.log('ArticlePage user', user);

  const navigate = useNavigate();

  useEffect(() => {
    const loadArticleInfo = async () => {
      console.log('user', user);
      const token = user && (await user.getIdToken());
      console.log('token', token);
      const headers = token ? { authToken: token } : {};
      console.log('headers>>>', headers);
      const response = await axios.get(`/api/articles/${articleId}`, {
        headers,
      });
      const updatedArticleInfo = response.data;
      console.log('updatedArticleInfo', updatedArticleInfo);
      setArticleInfo(updatedArticleInfo);
    };
    if (isLoading) loadArticleInfo();
  }, [isLoading, user]);

  const article = articles.find((article) => article.name === articleId);

  const addUpvote = async () => {
    const token = user && (await user.getIdToken());
    const headers = token ? { authToken: token } : {};
    const response = await axios.put(
      `/api/articles/${articleId}/upvote`,
      null,
      {
        headers,
      }
    );
    const updatedArticle = response.data;
    console.log('updatedArticle', updatedArticle);
    setArticleInfo(updatedArticle);
  };

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <h1>{article.title}</h1>
      <div className='upvotes-section'>
        {user ? (
          <button onClick={addUpvote}>
            {canUpvote ? 'Upvote' : 'Already Upvoted'}
          </button>
        ) : (
          <button onClick={() => navigate('/login')}>Log in to upvote</button>
        )}
        <p>This article has {articleInfo.upvotes} upvote(s)</p>
      </div>
      {article.content.map((art, idx) => {
        return <p key={idx}>{art}</p>;
      })}
      {user ? (
        <AddCommentForm
          articleName={articleId}
          onArticleUpdated={(updatedArticle) => setArticleInfo(updatedArticle)}
        />
      ) : (
        <button>Log in to add a comment</button>
      )}
      <CommentsList comments={articleInfo.comments} />
    </>
  );
};

export default ArticlePage;
