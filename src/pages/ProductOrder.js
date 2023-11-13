import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import endpoints from '../util/apicall';
import { profitOrderFormula } from "../util/profitOrderFormula";
import { updateInformation } from "../redux/actions/productActions";
import { useStaticPicker } from "@mui/x-date-pickers/internals";

export default function ProductOrder() {
    const [ecsites, setEcsites] = useState([]);
    const [error, setError] = useState("");
    const [orders, setOrders] = useState([]);
    const [formattedDate, setFormattedDate] = useState('')
    const [changed, setChanged] = useState(false);
    const [filterMonth, setFilterMonth] = useState('')
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
    const [filter_order_sum, setFilter_Order_Sum] = useState ( {
        purchase_price: 0,
        sell_price_en: 0,
        profit: 0,
        prima: 0,
        shipping: 0,
        profit_rate:0

    })
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
            // const p = profitFormula(order.sell_price_en, order.purchase_price, order.prima, order.shipping, settings);
            // setProfit(p)
        }).catch(error => {
            console.log(error);
        });
    }, [changed, settings]);


    const update = e => {
        const target = e.currentTarget;
        const orderValue = { ...order, [target.name]: target.value }
        console.log("test change", target.name, target.value)
        if(target.name == 'created_at') {
            // const inputDate = target.value;

            // // Create a Date object from the input string
            // const dateObject = new Date(inputDate);

            // // Format the date as "YYYY-M-D" using toLocaleDateString()
            // const formattedDateTemp = dateObject.toLocaleDateString('en-US', {
            // year: 'numeric',
            // month: 'numeric',
            // day: 'numeric',
            // });
            setFormattedDate(target.value)
        }
        
        setOrder({
            ...orderValue
        });

        let p = 0, rate = 0;
        p = profitOrderFormula(orderValue.sell_price_en, orderValue.purchase_price, orderValue.prima, orderValue.shipping, settings);
        rate = Number(p / (orderValue.sell_price_en * settings.rate) * 100).toFixed(2);

        setProfit(p);
        setProfitRate(rate);
    }

    function edit_order(index) {
        if (orders.length <= 0)
            return;

        const orderValue = orders[index];
        
        const inputDate = orderValue.created_at;
        console.log("testorder", String(inputDate))
        const date = inputDate.substring(0, 10);
        // const tempDate = new Date("2023-09-02")
    // Update the state with the extracted date
    
 
        setFormattedDate(String(date))
        setOrder(orderValue);
        
        let p = 0, rate = 0;
        p = profitOrderFormula(orderValue.sell_price_en, orderValue.purchase_price, orderValue.prima, orderValue.shipping, settings);
        rate = Number(p / (orderValue.sell_price_en * settings.rate) * 100).toFixed(2);
        
        setProfit(p);
        setProfitRate(rate);
    }

    function delete_order(id) {
        if (!window.confirm('削除しますか？')) {
            return;
        }
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
        let purchase, ebay;

        purchase = order.purchase_url;
        ebay = order.ebay_url;
        const sites = Object.values(ecsites);
        const keys = Object.keys(ecsites);
        let site = '';

        for (var i = 0; i < sites.length; i++) {
            if (sites.at(i) === order.ec_site) {
                site = keys.at(i);
                break;
            }
        }

        
        if (order.ebay_url === "") {
            setError('ebay URLを入力してください！');
            return;
        }

        
        if(site==='mercari' && order.purchase_url.search('shop') !== -1) {
            setError('警告！ 仕入れ URLは入力できません');
            return;
        }
        if(site==='mercari' && order.purchase_url.search('https://jp.mercari.com/item/') === -1) {
            setError('警告！ 仕入れ URLは入力できません');
            return;
        }
        if(site==='auctions' && order.purchase_url.search('https://page.auctions.yahoo.co.jp/jp/auction/') === -1) {
            setError('警告！ 仕入れ URLは入力できません');
            return;
        }
        if(site==='mercari' && purchase.lastIndexOf('/') !==27) {
            setError('警告！ 仕入れ URLは入力できません');
            return;
        }
        if(site==='auctions' && purchase.lastIndexOf('/') !==44) {
            setError('警告！ 仕入れ URLは入力できません');
            return;
        }
        if(site==='mercari' && purchase.slice(purchase.lastIndexOf('/') + 1).length !== 12) {
            setError('警告！ 仕入れ URLは入力できません');
            return;
        }
        if(site==='auctions' && purchase.slice(purchase.lastIndexOf('/') + 1).length < 11 &&   purchase.slice(purchase.lastIndexOf('/') + 1).length >12) {
            setError('警告！ 仕入れ URLは入力できません');
            return;
        }
        if(order.product_name =='') {
            setError('商品名を入力してください！！');
            return;
        }
        if (site!=='other' && order.purchase_url.search(site) === -1) {
            setError('警告！ フォーマットの異なるURLを入力しました。');
            return;
        }

        if (order.ecsite === '') {
            setError('EC siteをチェックしてください！');
            return;
        }

        if (order.purchase_url === "") {
            setError('仕入れ URLをチェックしてください！');
            return;
        }

        if (order.ebay_url === "") {
            setError('ebay URLを入力してください！');
            return;
        }
        if(ebay.lastIndexOf('/') !==24) {
            setError('警告！ ebay URLは入力できません');
            return;
        }
        if(ebay.slice(ebay.lastIndexOf('/') + 1).length !== 12) {
            setError('警告！ ebay URLは入力できません');
            return;
        }
        if(order.ebay_url.search("https://www.ebay.com/itm/") === -1) {
            setError('警告！ ebay URLは入力できません');
            return;
        }
        if (order.sell_price_en <= 0) {
            setError('販売価格を入力してください！');
            return;
        }
        if(order.sell_price_en ==0 || order.purchase_price == 0 || order.shipping == 0) {
            setError('入力されていない値があります!');
            return;
        }
        let p = order;
        p.profit = profitOrderFormula(order.sell_price_en, order.purchase_price, order.prima, order.shipping, settings);

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
                window.alert("登録完了")
            })
            .catch(error => {
                setError(error.message);
            });
    }
    useEffect(()=>{
        let counter=1, profit_sum=0, shipping_sum=0, purchage_price_sum =0, sell_price_en_sum=0, prima_sum=0, profit_rate_sum=0; 
        orders.map ((item,index)=> {
            
            profit_sum = profit_sum + Number(item.profit)
            purchage_price_sum = purchage_price_sum + Number(item.purchase_price)
            prima_sum =  prima_sum + Number(item. prima)
            shipping_sum=shipping_sum+ Number(item.shipping)
            sell_price_en_sum =  sell_price_en_sum + Number(item.sell_price_en)
            profit_rate_sum = profit_rate_sum+ Number(item.profit_rate)
            console.log("test rate", item.profit_rate)
            counter=index+1
          })
        profit_rate_sum = Number(profit_rate_sum/counter).toFixed(2);
          setFilter_Order_Sum({...filter_order_sum, purchase_price: purchage_price_sum,
            sell_price_en: sell_price_en_sum, profit: profit_sum, prima: prima_sum, shipping:shipping_sum, profit_rate: profit_rate_sum
        }) 
    }, [orders])
    const handleFilter = (date)=> {
        setFilterMonth(date)
        const formatted_Date = dayjs(date).format('YYYY-MM');
        endpoints.get_filter_orders(formatted_Date).then(response => {
            
            setOrders(response.data);
            
            // const p = profitFormula(order.sell_price_en, order.purchase_price, order.prima, order.shipping, settings);
            // setProfit(p)
        }).catch(error => {
            setError(error.message);
        });
        
          console.log('sum test:', filter_order_sum);
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
                                    <span className="input-group-text">フリマ送料(¥)</span>
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
                                    <input type="date" className="form-control" name="created_at" value={formattedDate} onChange={update} />
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
                                    <span className="input-group-text">ペイメント($)</span>
                                    <input type="text" className="form-control" name="sell_price_en" value={order.sell_price_en} onChange={update} />
                                </div>
                                <div className="col-lg-4 input-group mb-3">
                                    <span className="input-group-text">フリマ送料(¥)</span>
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
            <div className='product-header-2 d-flex justify-content-around'>
                <div className="d-flex gap-3 align-items-center">
                    <label>月選択</label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker', 'DatePicker', 'DatePicker']}>
                    
                    <DatePicker views={['month', 'year']} 
                        value={filterMonth}
                        onChange={handleFilter}
                    />
                </DemoContainer>
                </LocalizationProvider>
                </div>
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
                                
                            </th>
                            <th>
                                
                            </th>
                            <th>
                                
                            </th>
                            <th>
                                
                            </th>
                            <th>
                                
                            </th>
                            <th>
                                
                            </th>
                            <th>
                                
                            </th>
                            <th>
                            {filter_order_sum.profit}
                            </th>
                            <th>
                            {filter_order_sum.profit_rate}%
                            </th>
                            <th>
                                {filter_order_sum.purchase_price}
                            </th>
                            <th>
                                {filter_order_sum.prima}
                            </th>
                            <th>
                                {filter_order_sum.purchase_price+filter_order_sum.prima}
                            </th>
                            <th>
                            {filter_order_sum.sell_price_en}
                            </th>
                            <th>
                                {filter_order_sum.shipping}
                            </th>
                            <th>
                                
                            </th>
                            <th>
                                
                            </th>
                            <th></th>
                            <th></th>
                        </tr>
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
                            ペイメント
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
                                <td style={{ width: 100 }}>
                                    {item.created_at}
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
                                    <button type="button" className="btn btn-primary" onClick={() => edit_order(index)} data-bs-toggle="modal" data-bs-target="#editDialog" style={{ width: 70, height: 50 }}>編集</button>
                                </td>
                                <td>
                                    <button type="button" className="btn btn-danger" onClick={() => delete_order(item.id)} style={{ width: 70, height: 50 }}>削除</button>
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