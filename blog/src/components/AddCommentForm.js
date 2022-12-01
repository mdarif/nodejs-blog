import { useState } from 'react';
import axios from 'axios';
import useUser from '../hooks/useUser';

const AddCommentForm = ({ articleName, onArticleUpdated }) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const { user } = useUser();

  const addComment = async () => {
    const token = user && (await user.getIdToken());
    const headers = token ? { authToken: token } : {};
    const response = await axios.post(
      `/api/articles/${articleName}/comments`,
      {
        postedBy: name,
        text: comment,
      },
      {
        headers,
      }
    );

    const updatedArticle = await response.data;
    onArticleUpdated(updatedArticle);
    setName('');
    setComment('');
  };

  return (
    <>
      <div id='add-comment-form'>
        <h3>Add a Comment</h3>
        {user && <p>You are posting as {user.email}</p>}
        {/* <label>
          Name:
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label> */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          cols='50'
          rows='4'
        />
        <button onClick={addComment}>Add Comment</button>
      </div>
    </>
  );
};

export default AddCommentForm;
