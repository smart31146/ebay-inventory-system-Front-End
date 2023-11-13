import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'

import style from './Navbar.module.css';

import { setActivePage } from '../../redux/actions/productActions';
import isValidEmail from '../../util/isValidEmail';
import endpoints from '../../util/apicall';

export default function Navbar() {
    const navigate = useNavigate();
    const [active, setActive] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const dispatch = useDispatch();
    const activePage = useSelector(state => state.product.active_page);

    const [state, setState] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const update = e => {
        const target = e.currentTarget;

        setState({
            ...state, [target.name]: target.value
        })
    }

    function handleChangeEmail() {
        if (isValidEmail(state.email) === true) {
            endpoints.updateEmailAddress({user_id: user.id, email: state.email})
            .then(res => {
                Swal.fire({
                    title: 'お知らせ！',
                    text: res.data,
                    icon: 'success',
                    confirmButtonText: '確 認 '
                  })
            })
            .catch(error => {
                Swal.fire({
                    title: '警告！',
                    text: error.response.data,
                    icon: 'error',
                    confirmButtonText: '確 認 '
                  })
            })
            return;
        }
    }

    function handleChangePassword() {
        if(state['password'] === "")
            return;

        if (state['password'] !== state['confirmPassword']) {
            state['confirmPassword'] = '';
            return;
        }

        endpoints.updatePassword({user_id: user.id, psw: state['password']})
        .then(res => {
            Swal.fire({
                title: 'お知らせ！',
                text: res.data,
                icon: 'success',
                confirmButtonText: '確 認 '
              })
        })
        .catch(error => {
            Swal.fire({
                title: '警告！',
                text: error.response.data,
                icon: 'error',
                confirmButtonText: '確 認 '
              })
        })
    }

    function active_page(e) {
        e.preventDefault();

        let page = e.target.getAttribute('name');
        dispatch(setActivePage(page));
        navigate(page);
    }

    function logOut(e) {
        e.preventDefault();
        endpoints.logout().then(response => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            window.location.href = '/';
        }).catch(error => {
            console.log(error);
        });
    }

    return (
        <>
            <nav>
                <ul>
                    <li name='monitor' className={activePage['monitor'] ? style.nav_active : ''} onClick={active_page}>
                        監視
                    </li>
                    {
                        user.is_superuser && (
                            <>
                                <li name='manage' className={activePage['manage'] ? style.nav_active : ''} onClick={active_page}>
                                    ユーザー管理
                                </li>
                                <li name='delete-list' className={activePage['delete-list'] ? style.nav_active : ''} onClick={active_page}>
                                    削除一覧
                                </li>
                                <li name='order-list' className={activePage['order-list'] ? style.nav_active : ''} onClick={active_page}>
                                    オーダー
                                </li>
                                <li name='settings' className={activePage['settings'] ? style.nav_active : ''} onClick={active_page}>
                                    設定シート
                                </li>
                                <li name='register-ebay' className={activePage['register-ebay'] ? style.nav_active : ''} onClick={active_page}>
                                    eBay情報
                                </li>
                            </>
                        )
                    }
                </ul>

                <div className={style.user} onClick={() => { setActive(true) }}>
                    <span>Hi {user.username}</span>
                    <FontAwesomeIcon icon={faAngleDown} />
                </div>
            </nav>
            <div className={active ? `${style.wrapper} ${style.active}` : style.wrapper} style={{ zIndex: 1 }} onClick={() => { setActive(false) }}>
                <div className={style.user_content}>
                    <ul style={{ listStyle: 'none' }}>
                        <li data-bs-toggle="modal" data-bs-target="#personInfoDialog">
                            本人情報編集
                        </li>
                        <li onClick={logOut}>
                            ログアウト
                        </li>
                    </ul>
                </div>
            </div>
            <div className="modal fade" id="personInfoDialog">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">本人情報編集</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-lg-4 input-group mb-3">
                                    <span>新しいEメールアドレス</span>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <input type="text" className="form-control" name="email" value={state['email']} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3 justify-content-end border-0 border-bottom" >
                                    <button type="button" className="btn btn-primary w-25" style={{ marginBottom: 10, height: 40 }} onClick={handleChangeEmail}>メールアドレス変更</button>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span>新しいパスワード</span>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <input type="password" className="form-control" name="password" value={state['password']} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span>パスワード確認</span>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <input type="password" className="form-control" name="confirmPassword" value={state['confirmPassword']} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3 justify-content-end">
                                    <button type="button" className="btn btn-primary w-25" style={{height: 40}} onClick={handleChangePassword}>パスワード確認</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}