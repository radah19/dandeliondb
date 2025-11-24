import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css';

function Layout({user, setUser}: Props) {
  return (
    <div className="layout">
      <Navbar user={user} setUser={setUser} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

interface Props {
  user: any,
  setUser: (a: any) => void;
}