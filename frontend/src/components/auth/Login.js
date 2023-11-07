import { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import endpoints from '../../util/apicall';
import style from './Login.module.css';

// import { logged } from '../../redux/actions/userActions'
// import { useNavigate } from 'react-router-dom';

export default function Login() {
    // const dispatch = useDispatch();
    // const navigate = useNavigate();

    const [error, setError] = useState('');

    const [state, setState] = useState({
        email: '',
        password: '',
        loading: false
    });

    const [warning, setWarning] = useState({
        email: false,
        password: false,
    });

    useEffect(() => {
        if (error !== "") {
            window.alert(error);
            setError("");
        }
    }, [error])

    const update = e => {
        const target = e.currentTarget;
        if (target.value !== "") {
            setWarning({
                ...warning, [target.name]: false
            })
        }
        setState({
            ...state, [target.name]: target.value
        })
    }

    function handlesubmit() {
        let temp_warning = { ...warning };
        Object.keys(warning).forEach(e => {
            if (state[e] === "") {
                temp_warning[e] = true;
            }
        });
        setWarning(temp_warning);
        if (state['email'] !== '' && state['password'] !== '') {
            setState({
                ...state, loading: true
            });
            endpoints.login(state['email'], state['password']).then(response => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // dispatch(logged(response.data.user));

                // navigate('/')
                window.location.href = '/';
            }).catch(error => {
                setState({
                    ...state, loading: false
                });
                setError(error.response.data);
            })
        }
    }

    function callHandleSubmit(e) {
        if (e.which === 13) {
            handlesubmit();
        }
    }

    return (
        <div className={style.container_wrapper}>
            <div className={`${style.container} container`}>
                <div className={`${style.row} ${style.title}`}>
                    <h1>ログイン</h1>
                </div>

                <div className={`${style.row} ${style.error}`}>
                    {error}
                </div>
                <div className={`${style.row} ${style.email}`}>
                    <div className={style.label}>
                        メール
                    </div>
                    <input className={warning['email'] ? `${style.warning} ${style.default}` : style.default} type="text" name="email" placeholder="メールを入力してください。" onChange={update} />
                    <FontAwesomeIcon icon={faEnvelope} />
                </div>

                <div className={`${style.row} ${style.password}`}>
                    <div className={style.label}>
                        パスワード
                    </div>
                    <input className={warning['password'] ? `${style.warning} ${style.default}` : style.default} type="password" name="password" placeholder="パスワードを入力してください。" onChange={update} onKeyUp={callHandleSubmit} />
                    <FontAwesomeIcon icon={faLock} />
                </div>

                {/* <div className={`${style.row} ${style.forget_password}`}>
                    <a href="/forgetpassword">パスワードをお忘れですか？</a>
                </div> */}

                <div className={state['loading'] ? `${style.row} ${style.loading}` : style.row}>
                    <button className={`btn btn-primary ${style.login_btn}`} onClick={handlesubmit}>
                        <span>ログイン</span>
                        <span className={`${style.dot} ${style.dot1}`}></span>
                        <span className={`${style.dot} ${style.dot2}`}></span>
                        <span className={`${style.dot} ${style.dot3}`}></span>
                    </button>
                </div>

                <div className={`${style.row} ${style.not_register}`}>
                    <span>未登録？</span>
                    <span><a href="/register">アカウントを作成する</a></span>
                </div>
            </div>
        </div>
    )
}
