const shotTableColumns = [
    {
        title: 'Season',
        dataIndex: 'slugSeason',
        key: 'slugSeason',
        sorter: (a, b) => a.slugSeason.localeCompare(b.slugSeason),
    },
    {
        title: 'Center Midrange Percentage',
        dataIndex: 'center_mid',
        key: 'center_mid',
        sorter: (a, b) => a.center_mid - b.center_mid

    },
    {
        title: 'Paint Percentage',
        dataIndex: 'center_paint',
        key: 'center_paint',
        sorter: (a, b) => a.center_paint - b.center_paint
    },
    {
        title: 'Center Three Percentage',
        dataIndex: 'center_three',
        key: 'center_three',
        sorter: (a, b) => a.center_three - b.center_three
    },
    {
        title: 'Left Corner Three Percentage',
        dataIndex: 'lCorner_three',
        key: 'lCorner_three',
        sorter: (a, b) => a.lCorner_three - b.lCorner_three
    },
    {
        title: 'Left Wing Midrange Percentage',
        dataIndex: 'lWing_mid',
        key: 'lWing_mid',
        sorter: (a, b) => a.lWing_mid - b.lWing_mid
    },
    {
        title: 'Left Wing Three Percentage',
        dataIndex: 'lWing_three',
        key: 'lWing_three',
        sorter: (a, b) => a.lWing_three - b.lWing_three
    },
    {
        title: 'Right Corner Three Percentage',
        dataIndex: 'rCorner_three',
        key: 'rCorner_three',
        sorter: (a, b) => a.rCorner_three - b.rCorner_three
    },
    {
        title: 'Right Wing Midrange Percentage',
        dataIndex: 'rWing_mid',
        key: 'rWing_mid',
        sorter: (a, b) => a.rWing_mid - b.rWing_mid
    },
    {
        title: 'Right Wing Three Percentage',
        dataIndex: 'rWing_three',
        key: 'rWing_three',
        sorter: (a, b) => a.rWing_three - b.rWing_three
    },
    {
        title: 'Restricted Area Percentage',
        dataIndex: 'restrictedArea',
        key: 'restrictedArea',
        sorter: (a, b) => a.restrictedArea - b.restrictedArea
    }
]

const shotDistributionColumns = [
    {
        title: 'Zone Name',
        dataIndex: 'zoneBasic',
        key: 'zoneBasic',
    },
    {
        title: 'Zone Range',
        dataIndex: 'zoneRange',
        key: 'zoneRange',
    },
    {
        title: 'Make Percentage',
        dataIndex: 'make_percentage',
        key: 'make_percentage',
        sorter: (a, b) => a.make_percentage - b.make_percentage
    },
    {
        title: 'Attempts',
        dataIndex: 'attempts',
        key: 'attempts',
        sorter: (a, b) => a.attempts - b.attempts
    },
    {
        title: 'Take Percentage',
        dataIndex: 'take_percentage',
        key: 'take_percentage',
        sorter: (a, b) => a.take_percentage - b.take_percentage
    },
    {
        title: 'Optimal Take Percentage',
        dataIndex: 'opt_take_percentage',
        key: 'opt_take_percentage',
        sorter: (a, b) => a.opt_take_percentage - b.opt_take_percentage
    }
]


export {
    shotTableColumns,
    shotDistributionColumns
}