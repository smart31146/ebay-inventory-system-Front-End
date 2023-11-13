
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import endpoints from "../util/apicall";

const Calendar = () => {

    const [results, setResults] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [values, setValues] = useState([]);

    const worker = useSelector(state => state.product.worker);

    useEffect(() => {
        let y = selectedDate.getFullYear();
        let m = selectedDate.getMonth() + 1;

        if (m < 10)
            m = '0' + m;

        let d = y + '-' + m;

        let params = new URLSearchParams({ worker: worker, month: d });

        endpoints.get_results(params).then(async response => {
            if (response.data.error !== undefined) {
                setResults([]);
                return;
            }

            setResults(response.data);
        }).catch(error => {
            console.log(error);
        });
    }, [worker, selectedDate])

    useEffect(() => {
        let len = results.length;

        if (len > 0) {
            let v = [], i = 0;

            for (i = 1; i <= 31; i++)
                v[i] = 0;

            for (i = 0; i < len; i++) {
                var t = new Date(results[i].created_at);
                v[t.getDate()] += 1;
            }

            setValues(v);
        }
        else {
            setValues([]);
        }
    }, [results])

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const renderDay = (day, date) => {
        if(selectedDate === null)
            setSelectedDate(new Date());

        if (date.getMonth() === selectedDate.getMonth()) {
            return (
                <>
                    {values[day] > 0 ? <div><span className="hint badge bg-danger">{values[day]}</span><span className='date selected'>{day}</span></div> : <span className="date">{day}</span>}
                </>
            );
        }
        else {
            return (
                <span className="date" style={{color: '#a0a0a0'}}>{day}</span>
            )
        }
    };


    return (
        <>
            <span style={{padding: '10px 0px 10px 5px', color: 'red'}}>{`合計 ${results.length} 件`}</span>
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}

                onMonthChange={handleDateChange}

                showPopperArrow={false}

                showDayMonthPicker
                inline

                renderDayContents={renderDay} // you can use this prop
            />
        </>
    );
};

export default Calendar;