import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';

import { Button } from '../components/Button/Button';
import { RoomCode } from '../components/RoomCode/RoomCode';
import { Question } from '../components/Question/Question';

import { database } from '../services/firebase';

import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';

import { useRoom } from '../hooks/useRoom';

import '../styles/room.scss'

Modal.setAppElement('#root')

type RoomParams = {
  id: string;
}

export function AdminRoom() {

  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;
  
  const { title, questions } = useRoom(roomId)


  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      button: {
        color: '#3b10b9',
      },
    },
  };

  async function handleEndRoom() {

    database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    })
    history.push('/');
  }

    // Caso não queria usar o modal e sim somente a confirmação por janela do navegador usar o modelo abaixo..
    
  //   const resp = window.confirm('Tem certeza que você deseja encerrar essa sala?')

  //   if (!resp) {
  //   return;
  // } else {
  //   database.ref(`rooms/${roomId}`).update({
  //     endedAt: new Date(),
  //   })
  // }
  //   history.push('/');
  // }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    })
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    })
  }

  async function handleDeleteQuestion(questionId: string) {
    if (window.confirm('Tem certeza que você deseja excluir essa pergunta?')) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
    }
  }

  return(
    <div id="page-room">
      <header>
        <div className="content">
        <img src={logoImg} alt="Letmeask" />
        <div>
          <RoomCode code={roomId} />
          <Button isOutlined onClick={openModal}>Encerrar Sala</Button>
          <div className='Modal'>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
          >
            <h2>Tem certeza que você deseja encerrar essa sala?</h2>
            <hr />
            <button onClick={handleEndRoom}>Sim</button>
            <button onClick={closeModal}>Não</button>
          </Modal>
          </div>
        </div>
        </div>
      </header>
      
      <main>
        <div className='room-title'>
          <h1>Sala {title}</h1>
          { questions.length < 0 && <span>{questions} perguntas</span> }
        </div>  
        
        <div className="question-list">
          {questions.map(question => {
            return (
              <Question 
                key={question.id}
                content={question.content}
                author={question.author}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                {!question.isAnswered && (
                  <>
                  <button
                  type="button"
                  onClick={() => handleCheckQuestionAsAnswered(question.id)}
                >
                  <img src={checkImg} alt="Marcar pergunta como respondida" />
                </button>

                <button
                  type="button"
                  onClick={() => handleHighlightQuestion(question.id)}
                >
                  <img src={answerImg} alt="Dar destaque à pergunta" />
                </button>
                </>
                )}
                
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover Pergunta" />
                </button>
              </Question>
            )
          })}
        </div>

      </main>
    </div>
  );
}