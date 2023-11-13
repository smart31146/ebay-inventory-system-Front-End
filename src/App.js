import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Navbar from './components/layout/Navbar';
import Monitor from './pages/Monitor';
import DeleteList from './pages/DeleteList';
import ProductOrder from './pages/ProductOrder';
import Manage from './pages/Manage';
import Settings from './pages/Settings';
import Registerebay from './components/Registerebay'
import { useRef, useEffect } from 'react';

import endpoints from './util/apicall';
import { ebayInfoUpdated, updateInformation } from './redux/actions/productActions';
import { useDispatch } from 'react-redux';

export default function App() {
  // const settings = useSelector(state => state.product.settings);
  const dispatch = useDispatch();
  const update_ref = useRef(null);

  const startUpdateInfoTimer = () => {
    // Request to server
    if(localStorage.getItem('token')  !== null) {
      endpoints.update_info().then(res => {
        dispatch(updateInformation(res.data));
      })
      .catch(() => {
        
      })
    }
  }

  const clearUpdateInfoTimer = () => {
    if(update_ref.current)
      clearInterval(update_ref.current);

    const id = setInterval(() => {
      startUpdateInfoTimer();                               
    }, 600 * 1000);

    update_ref.current = id;
  }

  useEffect(() => {
    clearUpdateInfoTimer();
  }, [])

  if(localStorage.getItem('token')  === null) {
    return(
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Login />}>
          </Route>

          <Route path="/register" element={<Register />}>
          </Route>
          
          <Route path="*" element={<Navigate to={''} />}>
          </Route>

        </Routes>
      </BrowserRouter>
    )
  }
  else {
    return (
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<Monitor />}>
          </Route>

          <Route path="/manage" element={<Manage />}>
          </Route>
          
          <Route path="/monitor" element={<Monitor />}>
          </Route>

          <Route path="/order-list" element={<ProductOrder />}>
          </Route>

          <Route path="/delete-list" element={<DeleteList />}>
          </Route>

          <Route path="/settings" element={<Settings />}>
          </Route>

          <Route path="/register-ebay" element={<Registerebay />}>
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }
}
