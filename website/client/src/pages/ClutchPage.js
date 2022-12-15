import React, {useEffect, useState} from 'react';

import MenuBar from '../components/MenuBar';
import { getClutchPlayers } from '../fetcher';
import { Table } from 'antd';

function ClutchPage(props) {
    const [clutch, setClutch] = useState({});
    // const dummyData = [{"playerID":1629875,"name":"Xavier Moon","clutch_score":1.4199611688655065,"attempts":10},{"playerID":1626262,"name":"Coty Clarke","clutch_score":1.371230341417251,"attempts":1},{"playerID":2422,"name":"John Salmons","clutch_score":1.3090232392669723,"attempts":2},{"playerID":1630644,"name":"Mac McClung","clutch_score":1.28160802761726,"attempts":2}]
    const tableColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name) => <a href={`/players/${name}`}>{name}</a>
        },
        {
            title: 'Clutch Index',
            dataIndex: 'clutch_score',
            key: 'clutch_score',
            sorter: (a, b) => a.clutch_score - b.clutch_score
    
        },
        {
            title: 'Attempts',
            dataIndex: 'attempts',
            key: 'attempts',
            sorter: (a, b) => a.attempts - b.attemps
        }
    ];

    useEffect(() => {
        getClutchPlayers(0).then(res => {
            console.log(res);
            setClutch(res.results)
        });
    }, [])

    return (
        <div>
            <MenuBar/>
            <h1>Clutch Page!</h1>
            {/* <Table 
                dataSource={dummyData} 
                columns={tableColumns} 
                pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} 
                style={{ width: '70vw', margin: '0 auto', marginTop: '2vh' }}
                rowKey="playerID"
            /> */}
    
            {Object.keys(clutch).length > 0 &&
                <Table 
                    dataSource={clutch} 
                    columns={tableColumns} 
                    pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} 
                    style={{ width: '70vw', margin: '0 auto', marginTop: '2vh' }}
                    rowKey="playerID"
                />
            }
        </div>
    )
}

export default ClutchPage

