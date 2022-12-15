import React, {useEffect, useState} from 'react';

import MenuBar from '../components/MenuBar';
import { getClutchPlayers } from '../fetcher';
import { Table } from 'antd';

function ClutchPage(props) {
    const [clutch, setClutch] = useState({});

    const tableColumns = [
        {
            title: 'Name',
            dataIndex: 'Name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, row) => <p>{text}</p>
        },
        {
            title: 'Clutch Index',
            dataIndex: 'Clutch',
            key: 'clutch_score',
            sorter: (a, b) => a.clutch_score - b.clutch_score
    
        },
        {
            title: 'Attempts',
            dataIndex: 'Attempts',
            key: 'attemps',
            sorter: (a, b) => a.attempts - b.attemps
        }
    ];

    useEffect(() => {
        console.log("in useEffect")
        getClutchPlayers(0).then(res => {
            console.log(res);
            setClutch(res.results)
        });
    }, [])

    return (
        <div>
            <MenuBar/>
            <h1>Clutch Page!</h1>
            {Object.keys(clutch).length > 0 &&
                <Table dataSource={clutch} columns={tableColumns} pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} style={{ width: '70vw', margin: '0 auto', marginTop: '2vh' }}/>
            }
        </div>
    )
}

export default ClutchPage

