import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { IconSearch } from '@tabler/icons-react';
import Calendar from "../components/Calendar";

import endpoints from '../util/apicall';
import { profitFormula } from "../util/profitFormula";
import { workerChanged, ebayInfoUpdated, updateInformation } from "../redux/actions/productActions";

export default function Monitor() {
    const searchRef=useRef()
    const [ecsites, setEcsites] = useState([]);
    const [error, setError] = useState("");
    const [notDuplicate, setNotDuplicate] = useState(true);
    const [products, setProducts] = useState([]);

    // const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [changed, setChanged] = useState(false);

    const ec_site_ref = useRef(null);

    const dispatch = useDispatch();

    const [product, setProduct] = useState({
        id: '',
        created_at: '',
        updated_at: '',
        product_name: '',
        ec_site: 'メルカリ',
        purchase_url: '',
        ebay_url: '',
        purchase_price: 0,
        sell_price_en: 0,
        profit: 0,
        profit_rate: 0,
        prima: 0,
        shipping: 0,
        quantity: 0,
        created_by: '',
        notes: ''
    });

    const [profit, setProfit] = useState(0);
    const [profit_rate, setProfitRate] = useState(0);

    const settings = useSelector(state => state.product.settings);
    const worker = useSelector(state => state.product.worker);
    const user = JSON.parse(localStorage.getItem('user'));

    const [current_user, setCurrentUser] = useState(user.id);

    const register_dlg_ref = useRef(null);
    const edit_dlg_ref = useRef(null);
    const calendar_dlg_ref = useRef(null);

    useEffect(() => {
        if (user.is_superuser) {
            endpoints.get_users()
                .then(response => {
                    setUsers(response.data.users);
                })
                .catch(error => {
                    console.log(error);
                });
        }

        endpoints.get_ecsites()
            .then(res => {
                setEcsites(res.data);
            })
            .catch(error => {
                console.log(error);
            })

        endpoints.getEbayInfo()
            .then(res => {
                dispatch(ebayInfoUpdated(res.data));
            })
            .catch(err => {
                console.log(err);
            })

        endpoints.get_settings_attr().then(res => {
            dispatch(updateInformation(res.data));
        })
            .catch(err => {
                console.log(err);
            });

        dispatch(workerChanged(user.id));
    }, []);

    useEffect(() => {
        let params = new URLSearchParams({ created_by: current_user, user_id: user.id });
        endpoints.get_products(params).then(res => {
            setProducts(res.data);

        }).catch(error => {
            console.log(error);
        });

    }, [current_user, changed, settings]);

    useEffect(() => {
        if (error !== "") {
            window.alert(error);
            setError("");
        }
    }, [error])

    const update = (e) => {
        const target = e.currentTarget;
        const productValue = { ...product, [target.name]: target.value }

        setProduct({
            ...productValue
        });

        let p = 0, rate = 0;
        p = profitFormula(productValue.sell_price_en, productValue.purchase_price, productValue.prima, productValue.shipping, settings);
        rate = Number(p / (productValue.sell_price_en * settings.rate) * 100).toFixed(2);

        setProfit(p);
        setProfitRate(rate);
    }

    function changeCurrentUser(e) {
        setCurrentUser(e.target.value);
    }

    function updateWorker(e) {
        let worker = e.target.value;
        dispatch(workerChanged(worker));
    }

    function edit_product(index) {
        if (products.length <= 0)
            return;

        const productValue = products[index];

        setProduct(productValue);

        let p = 0, rate = 0;
        p = profitFormula(productValue.sell_price_en, productValue.purchase_price, productValue.prima, productValue.shipping, settings);
        rate = Number(p / (productValue.sell_price_en * settings.rate) * 100).toFixed(2);
        setProfit(p);
        setProfitRate(rate)
    }

    function delete_product(pid, e) {
        console.log("manual delete")
        if (!window.confirm('削除しますか？')) {
            return;
        }

        endpoints.delete_item({ id: pid }).then(res => {
            setChanged(!changed);
        })
            .catch(error => {
                setError(error.response.data);
            })
    }

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const fileToUpload = e.target.files[0];
        const formData = new FormData();
        formData.append("csvFile", fileToUpload);

        if (fileToUpload === null)
            return;


        endpoints.upload_product_file(formData).then(res => {
            setChanged(!changed);
        })
            .catch(error => {
                setError(error.response.data);
            })
    }

    function handleValidate(mode, e) {
        if(mode !== 1) {
            setNotDuplicate(true);
            return;
        }

        let purchase, ebay;

        purchase = product.purchase_url;
        ebay = product.ebay_url;

        let pos = ebay.lastIndexOf('/');

        // if (purchase === "") {
        //     // setError('仕入れ URLをチェックしてください！');
        //     return;
        // }

        const sites = Object.values(ecsites);
        const keys = Object.keys(ecsites);
        let site = '';

        for (var i = 0; i < sites.length; i++) {
            if (sites.at(i) === product.ec_site) {
                site = keys.at(i);
                break;
            }
        }
        
        if(site==='mercari' && product.purchase_url.search('shop') !== -1) {
            setError('警告！ このURLは入力できません');
            return;
        }

        if (product.purchase_url.search(site) === -1) {
            setError('警告！ フォーマットの異なるURLを入力しました。');
            return;
        }
        
        let item_id = ebay.slice(pos - ebay.length + 1);

        // confirm duplicate
        let info = {
            ecsite: site,
            url: e.target.value,
            item_id: item_id,
            mode: mode
        }

        endpoints.validate_product(info).then(res => {
            setNotDuplicate(true);
        })
            .catch(error => {
                setNotDuplicate(false);
                setError(error.response.data);
            });
    }

    function handleSubmit(mode) {

        if (mode === 1 && notDuplicate === false) {
            setError('すでに存在しています！');
            return;
        }

        const sites = Object.values(ecsites);
        const keys = Object.keys(ecsites);
        let site = '', temp = ec_site_ref.current.value;

        for (var i = 0; i < sites.length; i++) {
            if (sites.at(i) === temp) {
                site = keys.at(i);
                break;
            }
        }

        if(site==='mercari' && product.purchase_url.search('shop') !== -1) {
            setError('警告！ このURLは入力できません');
            return;
        }
        
        if (product.purchase_url.search(site) === -1) {
            setError('警告！ フォーマットの異なるURLを入力しました。');
            return;
        }

        if (product.ecsite === '') {
            setError('EC siteをチェックしてください！');
            return;
        }

        if (product.purchase_url === "") {
            setError('仕入れ URLをチェックしてください！');
            return;
        }

        if (product.ebay_url === "") {
            setError('ebay URLを入力してください！');
            return;
        }

        if (product.sell_price_en <= 0) {
            setError('販売価格を入力してください！');
            return;
        }

        let p = product;
        p.profit = profitFormula(product.sell_price_en, product.purchase_price, product.prima, product.shipping, settings);

        if (product.sell_price_en !== 0)
            p.profit_rate = Number(p.profit / (product.sell_price_en * settings.rate) * 100).toFixed(2);

        p.created_by = user.id;

        setProduct(p);
        let info = { product: product, order: '1', ecsite: ecsites[product.ecsite], mode: mode };

        endpoints.add_item(info)
            .then(() => {
                setNotDuplicate(false);
                setChanged(!changed);

                setProduct({
                    created_at: '',
                    updated_at: '',
                    product_name: '',
                    ec_site: ec_site_ref.current.value,
                    purchase_url: '',
                    ebay_url: '',
                    purchase_price: 0,
                    sell_price_en: 0,
                    profit: 0,
                    profit_rate: 0,
                    prima: 0,
                    shipping: 0,
                    quantity: 0,
                    created_by: '',
                    notes: ''
                });
            })
            .catch(error => {
                setError(error.response.data);
            });
    }
    const searchItem = () => {
        console.log(searchRef.current.value)
        if (searchRef.current.value=='') {
            let params = new URLSearchParams({ created_by: current_user, user_id: user.id });
            endpoints.get_products(params).then(res => {
                setProducts(res.data);

            }).catch(error => {
                console.log(error);
            });
        }
        else {
            let params = new URLSearchParams({ created_by: current_user, user_id: user.id, condition: searchRef.current.value });
            endpoints.get_products_filter(params).then(res => {
                console.log(res.data)
                setProducts(res.data);

            }).catch(error => {
                console.log(error);
                setError('存在しません。 もう一度確認してください！');

            });
        }
        
    }
    const getRegisterDialog = () => {
        const sites = Object.values(ecsites);

        return (
            <div className="modal fade" id="registerDialog" ref={register_dlg_ref}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">オーダー商品登録</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">ECサイト</span>
                                    <select className="form-select" name="ec_site" ref={ec_site_ref} value={product.ec_site} onChange={update}>
                                        {
                                            sites.map((v, i) => <option key={i} value={sites[i]}>{v}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">仕入れ URL</span>
                                    <input type="text" className="form-control" name="purchase_url" value={product.purchase_url} onChange={update} onBlur={(e) => handleValidate(1, e)} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">eBay URL</span>
                                    <input type="text" className="form-control" name="ebay_url" value={product.ebay_url} onChange={update} onBlur={(e) => handleValidate(1,e)}  />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">商品名</span>
                                    <input type="text" className="form-control" name="product_name" value={product.product_name} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">購入金額(¥)</span>
                                    <input type="text" className="form-control" name="purchase_price" value={product.purchase_price} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">販売価格($)</span>
                                    <input type="text" className="form-control" name="sell_price_en" value={product.sell_price_en} onChange={update} placeholder="$" />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">フリマ送料(¥)</span>
                                    <input type="text" className="form-control" name="prima" defaultValue={0} value={product.prima} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">輸出送料(¥)</span>
                                    <input type="text" className="form-control" name="shipping" value={product.shipping} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">利益額(¥)</span>
                                    <input type="text" className="form-control" value={profit} onChange={update} placeholder="" readOnly />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">利益率(%)</span>
                                    <input type="text" className="form-control" value={profit_rate} onChange={update} placeholder="" readOnly />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <label>備考</label>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <textarea className="form-control" name="notes" value={product.notes} onChange={update} />
                                </div>

                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => handleSubmit(1)}>商品登録</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getEditDialog = () => {
        const sites = Object.values(ecsites);

        return (
            <div className="modal fade" id="editDialog" ref={edit_dlg_ref}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">商品情報編集</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">ECサイト</span>
                                    <select className="form-select" name="ec_site" value={product.ec_site} onChange={update}>
                                        {
                                            sites.map((v, i) => <option key={i} value={sites[i]}>{v}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">仕入れ URL</span>
                                    <input type="text" className="form-control" name="purchase_url" value={product.purchase_url} onChange={update} onBlur={(e) => handleValidate(2, e)} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">eBay URL</span>
                                    <input type="text" className="form-control" name="ebay_url" value={product.ebay_url} onChange={update} onBlur={(e) => handleValidate(2, e)}  />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">商品名</span>
                                    <input type="text" className="form-control" name="product_name" value={product.product_name} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">購入金額(¥)</span>
                                    <input type="text" className="form-control" name="purchase_price" value={product.purchase_price} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">販売価格($)</span>
                                    <input type="text" className="form-control" name="sell_price_en" value={product.sell_price_en} onChange={update} placeholder="$" />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">フリマ送料(¥)</span>
                                    <input type="text" className="form-control" name="prima" defaultValue={0} value={product.prima} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">輸出送料(¥)</span>
                                    <input type="text" className="form-control" name="shipping" value={product.shipping} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">利益額 (¥)</span>
                                    <input type="text" className="form-control" value={profit} onChange={update} placeholder="" readonly />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">利益率(%)</span>
                                    <input type="text" className="form-control" value={profit_rate} onChange={update} placeholder="" readOnly />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <label>備考</label>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <textarea className="form-control" name="notes" value={product.notes} onChange={update} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => handleSubmit(2)}>アーカイブ</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getCalendarDialog = () => {
        return (
            <div className="modal fade" id="calendarDialog" ref={calendar_dlg_ref}>
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">日別出品件数</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">出品者</span>
                                    {user.is_superuser ? (
                                        <select className="form-select" name="worker" value={worker} onChange={updateWorker}>
                                            <option value=''></option>
                                            {
                                                users !== null && users.map((value, index) => <option key={index} value={value.id}>{value.username}</option>)
                                            }
                                        </select>
                                    ) : (
                                        <span style={{ padding: '5px 0 5px 20px' }}>{user.username}</span>
                                    )}

                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <Calendar />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className={user.is_superuser ? 'd-flex flex-wrap mt-4' : 'product-header-2'}>
                {
                    user.is_superuser && (
                        <div className="d-flex m-auto col-12 col-lg-8 gap-2">
                            <div className="ms-2 col-lg-4">
                                <select style={{ width: 200, height: 50 }} value={current_user} onChange={changeCurrentUser}>
                                    <option value=''>全体表示</option>
                                    {
                                        users !== null && users.map((value, index) => <option key={index} value={value.id}>{value.username}</option>)
                                    }
                                </select>
                            </div>

                            <div className="d-flex mb-3 input-group">
                                <div className="col-lg-8 col-8 form-outline">
                                    <input type="search" style={{ height: 50 }} placeholder="フリマ URL" id="form1" ref={searchRef} className="form-control" />
                                    {/* <label className="form-label" for="form1">Search</label> */}
                                </div>
                                <button type="button" className="btn btn-primary" onClick={searchItem}>
                                    <IconSearch />
                                </button>
                            </div>
                        </div>
                        
                    )
                }
                <div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ marginLeft: 10 }}>
                            <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#calendarDialog" style={{ width: 150, height: 50 }} >
                                <FontAwesomeIcon icon={faCalendar} style={{ marginRight: 10 }} />
                                日別出品件数
                            </button>
                        </div>
                        <div style={{ marginLeft: 10 }}>
                            <label htmlFor="fileupload" className="btn btn-primary" style={{ height: 50, width: 150, paddingTop: 12 }}>CSV一括登録</label>
                            <input id="fileupload" type="file" name="file" style={{ display: 'none' }} accept=".xlsx" onChange={handleFileUpload} />
                        </div>
                        <div style={{ marginLeft: 10 }}>
                            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#registerDialog" style={{ width: 150, height: 50 }}>登録</button>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', padding: 0, margin: '15px 0 0 0' }}>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center' }}>
                                No
                            </th>
                            <th>
                                商品名
                            </th>
                            <th>
                                EC site
                            </th>
                            <th className="w-20">
                                仕入れ URL
                            </th>
                            <th>
                                eBay URL
                            </th>
                            <th style={{ width: 100 }}>
                                利益額 (¥)
                            </th>
                            <th style={{ width: 100 }}>
                                利益率
                            </th>
                            <th>
                                仕入価格 (¥)
                            </th>
                            <th>
                                フリマ送料
                            </th>
                            <th>
                                仕入合計
                            </th>
                            <th>
                                販売価格 ($)
                            </th>
                            <th>
                                輸出送料
                            </th>
                            <th>
                                出品者
                            </th>
                            <th>
                                備考
                            </th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((item, index) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>
                                    {index + 1}
                                </td>
                                <td>
                                    {item.product_name}
                                </td>
                                <td>
                                    {item.ec_site}
                                </td>
                                <td>
                                    {item.purchase_url}
                                </td>
                                <td>
                                    {item.ebay_url}
                                </td>
                                <td className={item.profit < 1000 ? 'warning' : ''}>
                                    {item.profit}
                                </td>
                                <td className={item.profit_rate < 10 ? 'warning' : ''}>
                                    {
                                        item.profit_rate
                                    } %
                                </td>
                                <td>
                                    {item.purchase_price}
                                </td>
                                <td>
                                    {item.prima}
                                </td>
                                <td>
                                    {item.purchase_price + item.prima}
                                </td>
                                <td>
                                    {item.sell_price_en} $
                                </td>
                                <td>
                                    {item.shipping}
                                </td>
                                <td>
                                    {item.created_by__username}
                                </td>
                                <td>
                                    {item.notes}
                                </td>
                                <td>
                                    <button type="button" className="btn btn-primary" onClick={() => edit_product(index)} data-bs-toggle="modal" data-bs-target="#editDialog" style={{ width: 150, height: 50 }}>編集</button>
                                </td>
                                <td>
                                    <button type="button" className="btn btn-danger" onClick={(e) => delete_product(item.id, e)} style={{ width: 150, height: 50 }}>削除</button>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
            {getRegisterDialog()}
            {getEditDialog()}
            {getCalendarDialog()}
        </div>
    )
}