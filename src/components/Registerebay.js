import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faEdit } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-awesome-modal';

import endpoints from '../util/apicall';
import style from './Registerebay.module.css';
import { ebayInfoUpdated } from '../redux/actions/productActions';
import { useDispatch } from 'react-redux';

export default function Registerebay() {
    const user = JSON.parse(localStorage.getItem('user'));

    const [ebayInfo, setEbayInfo] = useState({
        app_id: '',
        dev_id: '',
        cert_id: '',
        ebay_token: ''
    });
    const [checkExist, setCheckExist] = useState(false);
    const [success, setSuccess] = useState(false);

    const dispatch = useDispatch(null);

    useEffect(() => {
        endpoints.getEbayInfo().then((response) => {
            if(response.data['app_id'] !== ''){
                setCheckExist(true);
            }
            setEbayInfo(response.data);
        }).catch((error)=> {
            console.log(error);
        });
    },[]);

    function validate(e){
        e.target.setCustomValidity('このフィールドに記入してください。');
    }

    function update(e) {
        if(e.target.value){
            e.target.setCustomValidity('');
        }
        setEbayInfo({
            ...ebayInfo,
            [e.target.name]: e.target.value
        });
    }

    function handleSubmit(e){
        e.preventDefault();

        if(user === undefined || user === null)
            return;

        let info = {
            super_id: user.id,
            ebayinfo: ebayInfo
        }

        endpoints.updateEbayInfo(info).then(res => {
            dispatch(ebayInfoUpdated(res.data));
            setSuccess(true);
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <>
            <h2 style={{textAlign: 'center', marginTop: 20}}>eBayアカウント設定</h2>
            <form onSubmit={handleSubmit} className={style.container}>
                <div className={style.row}>
                    <div className={style.label}>
                        APP_ID:
                    </div>

                    <div className={style.input}>
                        <input type="text" name="app_id" required value={ebayInfo['app_id']} onChange={update} onInvalid={validate}/>
                    </div>
                </div>

                <div className={style.row}>
                    <div className={style.label}>
                        DEV_ID:
                    </div>

                    <div className={style.input}>
                        <input type="text" name="dev_id" required value={ebayInfo['dev_id']} onChange={update} onInvalid={validate} />
                    </div>
                </div>

                <div className={style.row}>
                    <div className={style.label}>
                        CERT_ID:
                    </div>

                    <div className={style.input}>
                        <input type="text" name="cert_id" required value={ebayInfo['cert_id']} onChange={update} onInvalid={validate} />
                    </div>
                </div>

                <div className={style.row}>
                    <div className={style.label}>
                        TOKEN:
                    </div>

                    <div className={style.input}>
                        <input type="text" name="ebay_token" value={ebayInfo['ebay_token']} onChange={update} onInvalid={validate} />
                    </div>
                </div>

                <div className={style.row}>
                    <button className={`btn`}>
                        <span className={checkExist ? '' : style.register}>
                            <FontAwesomeIcon icon={faAdd} />
                            登 録
                        </span>
                        <span className={checkExist ? style.update : ''}>
                            <FontAwesomeIcon icon={faEdit} />
                            変 更
                        </span>
                    </button>
                </div>
            </form>            

            <Modal visible={success ? true : false} width="400" height="200" onClickAway={() => {setSuccess(false)}}>
                <div className={style.ebayinfo}>
                    <div className={style.message}>
                        操作が成功しました。
                    </div>

                    <button className={`btn`} onClick={() => {setSuccess(false)}}>
                        確 認 
                    </button>
                </div>
            </Modal>
        </>
    )
}
