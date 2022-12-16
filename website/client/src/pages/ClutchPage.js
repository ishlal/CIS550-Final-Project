import React, {useEffect, useState, useRef} from 'react';

import MenuBar from '../components/MenuBar';
import { getClutchPlayers, getClutchPlayerGames } from '../fetcher';
import { Table } from 'antd';

function ClutchPage(props) {
    const clutchMinRef = useRef();
    const [clutch, setClutch] = useState({});
    const [clutchGames, setClutchGames] = useState({});
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

    const clutchGameColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name) => <a href={`/players/${name}`}>{name}</a>
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => a.date.localeCompare(b.date)
        },
        {
            title: 'Matchup',
            dataIndex: 'matchup',
            key: 'matchup',
            sorter: (a, b) => a.matchup.localeCompare(b.matchup)
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
    ]

    useEffect(() => {
        getClutchPlayers(0).then(res => {
            setClutch(res.results)
        });
        getClutchPlayerGames().then(res => {
            setClutchGames(res.results)
        })
    }, [])

    const clutchOnSubmit = (e) => {
        e.preventDefault();
        getClutchPlayers(clutchMinRef.current.value).then(res => {
            setClutch(res.results);
        })
    }

    return (
        <div>
            <MenuBar/>
            <div className="text-center mt-5">
                <h1>Clutch Page!</h1>
        
                {Object.keys(clutch).length > 0 &&
                    <div className="text-center mt-5">
                        <h2>Most Clutch Players</h2>
                        <form onSubmit={clutchOnSubmit}>
                            <label>Minimum Attempts: </label>
                            <input type="number" ref={clutchMinRef}/>
                            <input type="submit"/>
                        </form>
                        <Table 
                            dataSource={clutch} 
                            columns={tableColumns} 
                            pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} 
                            style={{ width: '70vw', margin: '0 auto', marginTop: '2vh' }}
                            rowKey="playerID"
                        />
                    </div>
                }
                {Object.keys(clutchGames).length > 0 &&
                    <div className="text-center mt-5">
                        <h2>Most Clutch Single Game Performances</h2>
                        <Table 
                            dataSource={clutchGames} 
                            columns={clutchGameColumns} 
                            pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} 
                            style={{ width: '70vw', margin: '0 auto', marginTop: '2vh' }}
                            rowKey="Id"
                        />
                    </div>
                }
            </div>
        </div>
    )
}

export default ClutchPage

