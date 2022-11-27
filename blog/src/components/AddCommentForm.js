import { useState } from 'react';
import axios from 'axios';

const AddCommentForm = ({ articleName, onArticleUpdated }) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  const addComment = async () => {
    const response = await axios.post(`/api/articles/${articleName}/comments`, {
      postedBy: name,
      text: comment,
    });

    const updatedArticle = await response.data;
    onArticleUpdated(updatedArticle);
    setName('');
    setComment('');
  };

  return (
    <>
      <div id='add-comment-form'>
        <h3>Add a Comment</h3>
        <label>
          Name:
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Comment:
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            cols='50'
            rows='4'
          />
        </label>
        <button onClick={addComment}>Add Comment</button>
      </div>
    </>
  );
};

export default AddCommentForm;
