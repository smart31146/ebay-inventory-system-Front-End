import {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';

import endpoints from '../../util/apicall';
import isValidEmail from '../../util/isValidEmail';
import style from './Register.module.css';


export default function Register() {
    const [state, setState] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        loading: false,
    });
    const [warning, setWarning] = useState({
        userName: false,
        email: false,
        password: false,
        confirmPassword: false
    });
    const [error, setError] = useState('');

    const update = e => {
        const target = e.currentTarget;
        if(target.value !== ""){
            setWarning({
                ...warning, [target.name]: false
            })
        }
        setState({
            ...state, [target.name]: target.value
        })
    }

    function handlesubmit() {
        let temp_warning = {...warning};
        Object.keys(warning).forEach(e => {
            if(state[e] === ""){
                temp_warning[e] = true;
            }
        });
        if(state['password'] !== state['confirmPassword']){
            temp_warning['confirmPassword'] = true;
            state['confirmPassword'] = '';
        }
        if(isValidEmail(state['email']) === false){
            temp_warning['email'] = true;
        }
        setWarning(temp_warning);

        if(state['userName'] !== '' && state['email'] !== '' && state['password'] !== '' && state['confirmPassword'] !== '' && state['password'] === state['confirmPassword'] && isValidEmail(state['email']) === true){
            setState({
                ...state, loading: true
            });
            endpoints.register(state['userName'], state['email'], state['password'])
            .then((response) => {
                window.location.href = '/';
            }).catch(error => {
                setState({
                    ...state, loading: false
                });
                setError(error.data);
            });
        }
    }

    function callHandleSubmit(e){
        if(e.which === 13) {
            handlesubmit();
        }
    }
    
    return (
        <div className={style.container_wrapper}>
            <div className={`${style.container} container`}>
                <div className={`${style.row} ${style.title}`}>
                    <h1>新 規 登 録</h1>
                </div>

                <div className={`${style.row}  ${style.error}`}>
                    {error}
                </div>
                <div className={style.row}>
                    <input className={warning['email'] ? `${style.warning} ${style.default}` : style.default} name="email" type="text" placeholder="メール"  onChange={update} />
                    <FontAwesomeIcon icon={faEnvelope} />
                </div>

                <div className={style.row}>
                    <input className={warning['userName'] ? `${style.warning} ${style.default}` : style.default} name="userName" type="text" placeholder="ユーザー名" onChange={update} />
                    <FontAwesomeIcon icon={faUser} />
                </div>

                <div className={style.row}>
                    <input className={warning['password'] ? `${style.warning} ${style.default}` : style.default} name="password" type="password" placeholder="パスワード"  onChange={update} />
                    <FontAwesomeIcon icon={faLock} />
                </div>

                <div className={style.row}>
                    <input className={warning['confirmPassword'] ? `${style.warning} ${style.default}` : style.default} value={state['confirmPassword']} name="confirmPassword" type="password" placeholder="パスワード確認"  onChange={update} onKeyUp={callHandleSubmit} />
                    <FontAwesomeIcon icon={faLock} />
                </div>

                <div className={state['loading'] ? `${style.row} ${style.loading}` : style.row}>
                    <button className={`${style.btn} ${style.register_btn}`} onClick={handlesubmit}>
                        <span>新 規 登 録</span>
                        <span className= {`${style.dot} ${style.dot1}`}></span>
                        <span className={`${style.dot} ${style.dot2}`}></span>
                        <span className={`${style.dot} ${style.dot3}`}></span>
                    </button>
                </div>

                <div className={`${style.row} ${style.already_register}`}>
                    <span>すでに登録</span>
                    <span><a href="/">ログインページに移動</a></span>
                </div>
            </div>
        </div>
    )
}
