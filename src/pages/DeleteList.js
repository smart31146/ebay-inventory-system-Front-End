import { useState, useEffect } from "react";
import endpoints from '../util/apicall';

export default function DeleteList() {
    const [error, setError] = useState("");
    const [deletedList, setDeletedList] = useState([]);

    useEffect(() => {
        endpoints.get_custom_deleted_products().then(response => {
            setDeletedList(response.data);
        }).catch(error => {
            console.log(error);
        });

    }, []);

    useEffect(() => {
        if (error !== "")
            window.alert(error);

        setError('');
    }, [error])

    function migrate_product(pid, e) {
        
        if (!window.confirm('本当に資料を注文リストにに移動しますか？')) {
            return;
        }

        endpoints.migrate_del_item({ id: pid }).then(res => {
            window.alert(res.data)
            console.log("successful")
        })
            .catch(error => {
                setError(error.response.data);
            })
    }
    return (
        <div className="container-fluid">
            <div style={{ width: '100%', padding: 0, margin: '15px 0 0 0' }}>
                <table style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center' }}>
                                No
                            </th>
                            <th>
                                日付
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
                            削除日付
                            </th>
                            <th>
                                出品者
                            </th>
                            <th>
                                備考
                            </th>
                            <th></th>
                           
                        </tr>
                    </thead>

                    <tbody>
                        {deletedList.map((item, index) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>
                                    { index + 1 }
                                </td>
                                <td style={{ width: 100, height: 50 }}>
                                    {item.created_at}
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
                                <td style={{ width: 100, height: 50 }}>
                                    {item.deleted_at}
                                </td>
                                <td>
                                    {item.created_by__username}
                                </td>
                                <td>
                                    {item.notes}
                                </td>
                                {/* <td>
                                    <button type="button" className="btn btn-primary" onClick={() => edit_product(index)} data-bs-toggle="modal" data-bs-target="#editDialog" style={{ width: 70, height: 50 }}>編集</button>
                                </td> */}
                                <td>
                                    <button type="button" className="btn btn-primary" onClick={(e) => migrate_product(item.id, e)} style={{ width: 70, height: 50 }}>P/O</button>
                                </td>
                                {/* <td>
                                    <button type="button" className="btn btn-danger" style={{ width: 70, height: 50 }}>削除</button>
                                </td> */}
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}