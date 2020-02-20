import React, { Component } from 'react';
import { List, Avatar, Checkbox  } from 'antd';

class SubordinateList extends Component {

	render() {
		const { subordinates, meta, onChange, onSelect, isLoading } = this.props;

		return (
			<div className='subordinates'>
				<List
					itemLayout = 'horizontal'
					loading = { isLoading }
					dataSource = { subordinates }
					pagination = {
						{
							onChange: (page, pageSize) => {
								onChange(page, pageSize);
							},
							current: meta.page,
							pageSize: meta.pageSize,
							total: meta.total
						}
					}
					renderItem={item => (
						<List.Item
							key={item.id}
							actions={[<Checkbox key={1} checked={item.checked} onChange={(e) => onSelect(e, item)}>Выбрать</Checkbox>]}
						>
							<List.Item.Meta
								avatar={<Avatar src={item.pict_url} />}
								title={item.fullname}
								description={item.position_name}
							/>
						</List.Item>
					)}
				/>
			</div>
		);
	}
}

export default SubordinateList;
