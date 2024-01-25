import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useHistory, useParams } from 'react-router-dom';
import { url } from '../const';
import { Header } from '../components/Header';
import './editTask.scss';

export function EditTask() {
  const history = useHistory();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [limit, setLimit] = useState('');
  const [isDone, setIsDone] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleDateChange = (e) => {
    // const dateObj = new Date(e.target.value);
    // const isoDateTime = dateObj.toISOString();
    // // 先頭から末尾5桁以外の文字をZと連結して形式を整える
    // const formattedDateTime = `${isoDateTime.substring(0, isoDateTime.length - 5)}Z`;
    // console.log(formattedDateTime);
    setLimit(e.target.value);
  };
  const handleIsDoneChange = (e) => setIsDone(e.target.value === 'done');
  const onUpdateTask = () => {
    // 登録の際はUTC準拠
    const dateObj = new Date(limit);
    const isoDateTime = dateObj.toISOString();
    const formattedDateTime = `${isoDateTime.substring(0, isoDateTime.length - 5)}Z`;

    const data = {
      title,
      detail,
      done: isDone,
      limit: formattedDateTime,
    };

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        history.push('/');
        console.log(res.data);
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`);
      });
  };

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        history.push('/');
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data;
        setTitle(task.title);
        setDetail(task.detail);
        setIsDone(task.done);

        // DBの時間から+9時間して表示させる
        const dateObj = new Date(task.limit);
        dateObj.setTime(dateObj.getTime() + 9 * 60 * 60 * 1000);
        const localDateTime = dateObj.toISOString().substring(0, 16);
        setLimit(localDateTime);
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });
  }, []);

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <input
            type="datetime-local"
            onChange={handleDateChange}
            className="edit-task-date"
            value={limit}
          />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? 'checked' : ''}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? 'checked' : ''}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  );
}
