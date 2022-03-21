import { useHistory } from 'react-router-dom';

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import googleIconImg from '../assets/images/google-icon.svg';

import '../styles/auth.scss';
import { Button } from '../components/Button/Button';
import { useAuth } from '../hooks/useAuth';
import { FormEvent, useState } from 'react';
import { database } from '../services/firebase';
import { toast, ToastContainer } from 'react-toastify';



export function Home() {
  const history = useHistory();
  const { user, signInWithGoogle } = useAuth();
  const [roomCode, setRoomCode] = useState('');

  async function handleCreateRoom() {
    if (!user) {
      await signInWithGoogle()
    }
    history.push("/new/rooms");
  }

  async function handleJoinRoom(event: FormEvent) {
    event.preventDefault();

    if (roomCode.trim() === '') {
      toast.error('Informe o código da sala ou crie uma nova sala.')
      return;
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get();

    if (!roomRef.exists()) {
      toast.error('Sala não existe.')
      return;
    }

    if (roomRef.val().endedAt) {
      toast.error('Sala está fechada.');
      return;
    }

    if (roomRef.val().authorId === user?.id) {
      history.push(`/admin/rooms/${roomCode}`);
    } else {
      history.push(`/rooms/${roomCode}`);
    }

  }

  return(
    <div id="page-auth">
      <aside>
        <img src={illustrationImg} alt="Ilustração simbolizando troca de pergunta" />
        <strong>Crie salas de Perguntas ao-vivo</strong>
        <p>Tire suas dúvidas em tempo-real</p>
      </aside>
    <main>
    <ToastContainer position="top-right" autoClose={5000}hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover={false}/>
      <div className="main-content">
        <img src={logoImg} alt="Letmeask" />
        <button onClick={handleCreateRoom} className="create-room">
          <img src={googleIconImg} alt="Logo do Google" />
          Crie sua sala com Google
          </button>
        <div className="separator">ou entre em uma sala</div>
        <form onSubmit={handleJoinRoom}>
          <input 
          type="text"
          placeholder="Digite o código da sala" 
          onChange={event => setRoomCode(event.target.value)}
          value={roomCode}
          />
          <Button type="submit">
          Entrar na sala
          </Button>
        </form>
      </div>
    </main>
  </div>
)
}