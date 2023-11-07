import { useState, useEffect } from "react";
import endpoints from '../util/apicall';

export default function DeleteList() {
    const [error, setError] = useState("");
    const [deletedList, setDeletedList] = useState([]);

    useEffect(() => {
        endpoints.get_deleted_items().then(response => {
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

    return (
        <div className="container-fluid">
            <div style={{ width: '100%', padding: 0, margin: '15px 0 0 0' }}>
                <table style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center', width: 50 }}>
                                No
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
                                削除日付
                            </th>
                            <th>
                                出品者
                            </th>
                            <th>
                                備考
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {deletedList.map((item, index) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>
                                    { index + 1 }
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
                                <td>
                                    {item.deleted_at}
                                </td>
                                <td>
                                    {item.created_by__username}
                                </td>
                                <td>
                                    {item.notes}
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}