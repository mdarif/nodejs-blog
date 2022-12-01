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

  const navigate = useNavigate();

  useEffect(() => {
    const loadArticleInfo = async () => {
      /**
       * getIdToken ( forceRefresh ? :  boolean ) : Promise < string >
       *
       * Returns a JSON Web Token (JWT) used to identify the user to a
       * Firebase service.
       *
       * Returns the current token if it has not expired. Otherwise,
       * this will refresh the token and return a new one.
       */
      const token = user && (await user.getIdToken());

      // If token exists than send it to the server as 'authToken' key
      // in the Axios 'headers'
      const headers = token ? { authToken: token } : {};

      const response = await axios.get(`/api/articles/${articleId}`, {
        // `headers` are custom headers to be sent
        headers,
      });
      const updatedArticleInfo = response.data;
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
      null, // request body
      {
        headers, // `headers` are custom headers to be sent
      }
    );
    const updatedArticle = response.data;
    setArticleInfo(updatedArticle);
  };

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
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
        <button onClick={() => navigate('/login')}>
          Log in to add a comment
        </button>
      )}
      <CommentsList comments={articleInfo.comments} />
    </>
  );
};

export default ArticlePage;
