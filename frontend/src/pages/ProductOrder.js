import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import endpoints from '../util/apicall';
import { profitFormula } from "../util/profitFormula";
import { updateInformation } from "../redux/actions/productActions";

export default function ProductOrder() {
    const [ecsites, setEcsites] = useState([]);
    const [error, setError] = useState("");
    const [orders, setOrders] = useState([]);

    const [changed, setChanged] = useState(false);

    const [order, setOrder] = useState({
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
        order_num: '',
        ordered_at: '',
        created_by: '',
        notes: ''
    });

    const [profit, setProfit] = useState(0);
    const [profit_rate, setProfitRate] = useState(0);

    const settings = useSelector(state => state.product.settings);
    const user = JSON.parse(localStorage.getItem('user'));

    const dispatch = useDispatch();

    const dialog_ref = useRef(null);
    const edit_dialog_ref = useRef(null);

    useEffect(() => {
        endpoints.get_ecsites()
            .then(res => {
                setEcsites(res.data);
            })
            .catch(error => {
                console.log(error);
            })

        endpoints.get_settings_attr().then(res => {
            dispatch(updateInformation(res.data));
        })
            .catch(err => {
                console.log(err);
            });
    }, []);


    useEffect(() => {
        if (error !== "")
            window.alert(error);

        setError('');
    }, [error])

    useEffect(() => {
        endpoints.get_orders().then(response => {
            setOrders(response.data);
        }).catch(error => {
            console.log(error);
        });
    }, [changed, settings]);


    const update = e => {
        const target = e.currentTarget;
        const orderValue = { ...order, [target.name]: target.value }

        setOrder({
            ...orderValue
        });

        let p = 0, rate = 0;
        p = profitFormula(orderValue.sell_price_en, orderValue.purchase_price, orderValue.prima, orderValue.shipping, settings);
        rate = Number(p / (orderValue.sell_price_en * settings.rate) * 100).toFixed(2);

        setProfit(p);
        setProfitRate(rate);
    }

    function edit_order(index) {
        if (orders.length <= 0)
            return;

        const orderValue = orders[index];
        setOrder(orderValue);

        let p = 0, rate = 0;
        p = profitFormula(orderValue.sell_price_en, orderValue.purchase_price, orderValue.prima, orderValue.shipping, settings);
        rate = Number(p / (orderValue.sell_price_en * settings.rate) * 100).toFixed(2);
        
        setProfit(p);
        setProfitRate(rate);
    }

    function delete_order(id) {
        endpoints.delete_order_item({ id: id }).then(res => {
            setChanged(!changed);
        })
            .catch(error => {
                setError(error.res.data);
            })
    }

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const fileToUpload = e.target.files[0];
        const formData = new FormData();
        formData.append("csvFile", fileToUpload);

        if (fileToUpload === null)
            return;

        endpoints.upload_order_file(formData).then(res => {
            setChanged(!changed);
        })
            .catch(error => {
                setError(error.response.data);
            })
    }

    function handleSubmit(mode) {
        if (order.purchase_url === "") {
            setError('仕入れ URLをチェックしてください！');
            return;
        }

        const sites = Object.values(ecsites);
        const keys = Object.keys(ecsites);
        let site = '';

        for (var i = 0; i < sites.length; i++) {
            if (sites.at(i) === order.ec_site) {
                site = keys.at(i);
                break;
            }
        }

        if (order.purchase_url.search(site) === -1) {
            setError('警告！ フォーマットの異なるURLを入力しました。');
            return;
        }

        if (order.ebay_url === "") {
            setError('ebay URLを入力してください！');
            return;
        }

        if (order.sell_price_en <= 0) {
            setError('販売価格を入力してください！');
            return;
        }

        let p = order;
        p.profit = profitFormula(order.sell_price_en, order.purchase_price, order.prima, order.shipping, settings);

        if (order.sell_price_en !== 0)
            p.profit_rate = Number(p.profit / (order.sell_price_en * settings.rate) * 100).toFixed(2);

        p.created_by = user.id;

        setOrder(p);
        let info = { order: order, mode: mode };

        endpoints.add_order_item(info)
            .then(() => {
                setChanged(!changed);

                setOrder({
                    id: '',
                    created_at: '',
                    updated_at: '',
                    product_name: '',
                    ec_site: '',
                    purchase_url: '',
                    ebay_url: '',
                    purchase_price: 0,
                    sell_price_en: 0,
                    profit: 0,
                    profit_rate: 0,
                    prima: 0,
                    shipping: 0,
                    quantity: 0,
                    order_num: '',
                    ordered_at: '',
                    created_by: '',
                    notes: ''
                });
            })
            .catch(error => {
                setError(error.message);
            });
    }

    const getRegisterDialog = () => {
        const sites = Object.values(ecsites);

        return (
            <div className="modal fade" id="registerDialog" ref={dialog_ref}>
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
                                    <select className="form-select" name="ec_site" value={order.ec_site} onChange={update}>
                                        {
                                            sites.map((v, i) => <option key={i} value={v}>{v}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">日付</span>
                                    <input type="date" className="form-control" name="created_at" value={order.created_at} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">オーダーNo</span>
                                    <input type="text" className="form-control" name="order_num" value={order.order_num} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">仕入れ URL</span>
                                    <input type="text" className="form-control" name="purchase_url" value={order.purchase_url} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">eBay URL</span>
                                    <input type="text" className="form-control" name="ebay_url" value={order.ebay_url} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">商品名</span>
                                    <input type="text" className="form-control" name="product_name" value={order.product_name} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">購入金額(¥)</span>
                                    <input type="text" className="form-control" name="purchase_price" value={order.purchase_price} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">販売価格($)</span>
                                    <input type="text" className="form-control" name="sell_price_en" value={order.sell_price_en} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">プリマ送料(¥)</span>
                                    <input type="text" className="form-control" name="prima" value={order.prima} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">輸出送料(¥)</span>
                                    <input type="text" className="form-control" name="shipping" value={order.shipping} onChange={update} />
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
                                    <textarea className="form-control" name="notes" value={order.notes} onChange={update} />
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
            <div className="modal fade" id="editDialog" ref={edit_dialog_ref}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">注文商品の編集</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">ECサイト</span>
                                    <select className="form-select" name="ec_site" value={order.ec_site} onChange={update}>
                                        {
                                            sites.map((v, i) => <option key={i} value={v}>{v}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">日付</span>
                                    <input type="date" className="form-control" name="created_at" value={order.created_at} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">オーダーNo</span>
                                    <input type="text" className="form-control" name="order_num" value={order.order_num} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">仕入れ URL</span>
                                    <input type="text" className="form-control" name="purchase_url" value={order.purchase_url} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">eBay URL</span>
                                    <input type="text" className="form-control" name="ebay_url" value={order.ebay_url} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">商品名</span>
                                    <input type="text" className="form-control" name="product_name" value={order.product_name} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">購入金額(¥)</span>
                                    <input type="text" className="form-control" name="purchase_price" value={order.purchase_price} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">販売価格($)</span>
                                    <input type="text" className="form-control" name="sell_price_en" value={order.sell_price_en} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">プリマ送料(¥)</span>
                                    <input type="text" className="form-control" name="prima" value={order.prima} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">輸出送料(¥)</span>
                                    <input type="text" className="form-control" name="shipping" value={order.shipping} onChange={update} />
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
                                    <textarea className="form-control" name="notes" value={order.notes} onChange={update} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => handleSubmit(2)}>アーカイブ</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className='product-header-2'>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ marginRight: 10 }}>
                        <label htmlFor="fileupload" className="btn btn-primary" style={{ height: 50, width: 150, paddingTop: 12 }}>CSV一括登録</label>
                        <input id="fileupload" type="file" name="file" style={{ display: 'none' }} accept=".xlsx" onChange={handleFileUpload} />
                    </div>
                    <div>
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#registerDialog" style={{ width: 150, height: 50 }}>登録</button>
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
                                日付
                            </th>
                            <th>
                                オーダーNo
                            </th>
                            <th>
                                商品名
                            </th>
                            <th>
                                EC site
                            </th>
                            <th>
                                仕入れ URL
                            </th>
                            <th>
                                eBay URL
                            </th>
                            <th>
                                利益額
                            </th>
                            <th>
                                利益率
                            </th>
                            <th>
                                仕入価格
                            </th>
                            <th>
                                フリマ送料
                            </th>
                            <th>
                                仕入合計
                            </th>
                            <th>
                                販売価格
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
                        {orders.map((item, index) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>
                                    {index + 1}
                                </td>
                                <td>
                                    {item.ordered_at}
                                </td>
                                <td>
                                    {item.order_num}
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
                                    <button type="button" className="btn btn-primary" onClick={() => edit_order(index)} data-bs-toggle="modal" data-bs-target="#editDialog" style={{ width: 150, height: 50 }}>編集</button>
                                </td>
                                <td>
                                    <button type="button" className="btn btn-danger" onClick={() => delete_order(item.id)} style={{ width: 150, height: 50 }}>削除</button>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
            {getRegisterDialog()}
            {getEditDialog()}
        </div>
    )
}