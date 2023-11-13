import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-awesome-modal';
import style from './Settings.module.css'

import endpoints from '../util/apicall';

import { updateInformation } from '../redux/actions/productActions';

export default function Settings() {

    const [warning, setWarning] = useState({
        'email_address': '',
        'psw': '',
        'variable_price': false,
        'fvf': false,
        'oversea': false,
        'payoneer': false,
        'fedex': false,
        'rate': false,
        'mercari': false,
        'auctions': false,
        'paypay': false
    });

    const settings = useSelector((state) => {
        return state.product.settings;
    });

    const [mail_setting, setMailSetting] = useState({
        email_address: settings.email_address,
        psw: settings.psw
    })

    const [success, setSuccess] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        endpoints.get_settings_attr().then(res => {
            dispatch(updateInformation(res.data));
        })
            .catch(err => {
                console.log(err);
            });
    }, []);

    function update(e) {
        let key = e.target.getAttribute('name');
        let value = e.target.textContent;

        let temp = {};
        Object.assign(temp, settings);
        temp[key] = value;

        endpoints.update_settings_attr(temp)
            .then(res => {
                dispatch(updateInformation(res.data));
            })
            .catch(err => {
                console.log(err);
            })
    }

    function handleChange(e) {
        let key = e.target.getAttribute('name');
        let value = e.target.value;

        let temp = {};
        Object.assign(temp, settings);
        temp[key] = value;

        endpoints.update_settings_attr(temp)
            .then(res => {
                dispatch(updateInformation(res.data));
            })
            .catch(err => {
                console.log(err);
            })
    }

    function handleMailSetting(e) {
        let value = e.target.value;

        setMailSetting({
            ...mail_setting, [e.target.name]: value
        });
    }

    function saveMailSetting(e) {
        e.preventDefault();

        let temp = {};
        Object.assign(temp, settings);
        temp['email_address'] = mail_setting.email_address;
        temp['psw'] = mail_setting.psw;

        endpoints.update_settings_attr(temp)
            .then(res => {
                dispatch(updateInformation(res.data));
                setSuccess(true);
            })
            .catch(err => {
                console.log(err);
            })
    }

    return (
        <div>
            <div className={style.content}>
                <div className='card' style={{ width: "500px", maxWidth: "100%", margin: "60px auto auto auto", padding: 10 }}>
                    <div className="col-lg-4 input-group mb-3">
                        <h5>メール通知設定</h5>
                    </div>
                    <div className="col-lg-4 input-group mb-3">
                        <span className="input-group-text">メールアドレス</span>
                        <input type="text" className="form-control" name="email_address" value={mail_setting.email_address} onChange={handleMailSetting} />
                    </div>
                    <div className="col-lg-4 input-group mb-3">
                        <span className="input-group-text">パスワード</span>
                        <input type="password" className="form-control" name="psw" value={mail_setting.psw} onChange={handleMailSetting} />
                    </div>
                    <div className="col-lg-4 input-group mb-3 justify-content-end">
                        <button className="btn btn-primary w-50" style={{ height: 50 }} onClick={saveMailSetting}>
                            <FontAwesomeIcon icon={faSave} />
                            <span style={{ marginLeft: 15 }}>登 録</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className={style.content}>
                <table className={style.profit_attr}>
                    <thead>
                        <tr>
                            <th className='w-50'>設定セット名</th>
                            <th>セット値</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>変動価格（円）</td>
                            <td className={warning['variable_price'] ? style.warning : ''}><span className={style.contenteditable} contentEditable name="variable_price" onBlur={update}>{settings['variable_price']}</span></td>
                        </tr>
                        <tr>
                            <td>FVF(%)</td>
                            <td className={warning['fvf'] ? style.warning : ''}><span className={style.contenteditable} contentEditable name="fvf" onBlur={update}>{settings['fvf']}</span></td>
                        </tr>
                        <tr>
                            <td>海外手数料(%)</td>
                            <td className={warning['oversea'] ? style.warning : ''}><span className={style.contenteditable} contentEditable name="oversea" onBlur={update}>{settings['oversea']}</span></td>
                        </tr>
                        <tr>
                            <td>Payoneer為替手数料(%)</td>
                            <td className={warning['payoneer'] ? style.warning : ''}><span className={style.contenteditable} contentEditable name="payoneer" onBlur={update}>{settings['payoneer']}</span></td>
                        </tr>
                        <tr>
                            <td>FedEx燃料(%)</td>
                            <td className={warning['fedex'] ? style.warning : ''}><span className={style.contenteditable} contentEditable name="fedex" onBlur={update}>{settings['fedex']}</span></td>
                        </tr>
                        <tr>
                            <td>為替レート(円/$)</td>
                            <td className={warning['rate'] ? style.warning : ''}><span className={style.contenteditable} contentEditable name="rate" onBlur={update}>{settings['rate']}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={style.content}>
                <table className={style.profit_attr}>
                    <thead>
                        <tr>
                            <th>ECサイト</th>
                            <th>更新日</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='w-50'>メルカリ</td>
                            <td>
                                <select className="form-select" name='mercari' value={settings['mercari']} onChange={handleChange}>
                                    <option value='1か月前'>1か月前</option>
                                    <option value='2か月前'>2か月前</option>
                                    <option value='3か月前'>3か月前</option>
                                    <option value='4か月前'>4か月前</option>
                                    <option value='5か月前'>5か月前</option>
                                    <option value='半年以上前'>半年以上前</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td className='w-50'>Paypayフリマ</td>
                            <td>
                                <select className="form-select" name='paypay' value={settings['paypay']} onChange={handleChange}>
                                    <option value='1ヶ月前に更新'>1ヶ月前に更新</option>
                                    <option value='2ヶ月前に更新'>2ヶ月前に更新</option>
                                    <option value='3ヶ月前に更新'>3ヶ月前に更新</option>
                                    <option value='4ヶ月前に更新'>4ヶ月前に更新</option>
                                    <option value='5ヶ月前に更新'>5ヶ月前に更新</option>
                                    <option value='6ヶ月前に更新'>6ヶ月前に更新</option>
                                    <option value='7ヶ月前に更新'>7ヶ月前に更新</option>
                                    <option value='8ヶ月前に更新'>8ヶ月前に更新</option>
                                    <option value='9ヶ月前に更新'>9ヶ月前に更新</option>
                                    <option value='10ヶ月前に更新'>10ヶ月前に更新</option>
                                    <option value='11ヶ月前に更新'>11ヶ月前に更新</option>
                                    <option value='12ヶ月前に更新'>12ヶ月前に更新</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <Modal visible={success ? true : false} width="400" height="200" onClickAway={() => { setSuccess(false) }}>
                <div className={style.ebayinfo}>
                    <div className={style.message}>
                        操作が成功しました。
                    </div>

                    <button className={`btn`} onClick={() => { setSuccess(false) }}>
                        確 認
                    </button>
                </div>
            </Modal>
        </div>
    )
}