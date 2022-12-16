import React, {useState, useEffect} from 'react';
import { Table } from 'antd';

import MenuBar from '../components/MenuBar';
import { getLuckyPerformances, getShotsTeamName } from '../fetcher';

function LuckPage(props) {
    const [luck, setLuck] = useState({});
    const tableColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name) => <a href={`/teams/${name}`}>{name}</a>
        },
        {
            title: 'Game',
            dataIndex: 'matchup',
            key: 'matchup'
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Luck Index',
            dataIndex: 'luck_index',
            key: 'luck_index',
            sorter: (a, b) => a.luck_index - b.luck_index
    
        },
        {
            title: 'Attempts',
            dataIndex: 'attempts',
            key: 'attempts',
            sorter: (a, b) => a.attempts - b.attemps
        }
    ];

    useEffect(() => {
        getLuckyPerformances().then(res => {
            setLuck(res.results)
        });
    }, [])

    return (
        <div>
            <MenuBar/>
            <h1>Luck Page!</h1>
    
            {Object.keys(luck).length > 0 &&
                <Table 
                    dataSource={luck} 
                    columns={tableColumns} 
                    pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} 
                    style={{ width: '70vw', margin: '0 auto', marginTop: '2vh' }}
                    rowKey="Id"
                />
            }
        </div>
    )
}

export default LuckPage

