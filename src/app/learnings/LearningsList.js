import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLearnings, selectItem } from './learningActions';
import { List, Checkbox, Avatar, Icon, Input } from 'antd';
import './learnings.css';

class LearningsList extends Component {

	constructor(props){
		super(props);

		this.type = props.type;
	}

	componentDidMount() {
		this.props.getLearnings(this.type);
	}

	render() {
		const { learnings, selectedLearnings, ui, meta, selectItem, getLearnings } = this.props;

		return (
			<div className='learnings'>
				<Input
					className='learnings__search'
					allowClear
					placeholder='Поиск'
					prefix={<Icon type='search' style={{ color: 'rgba(0,0,0,.25)' }} />}
					onPressEnter={(e) => getLearnings(this.type, 1, null, e.target.value)}
				/>
				<List
					size='small'
					itemLayout = 'horizontal'
					loading = { (ui.isLoadingLearnings || ui.isAssignLearnings) }
					dataSource = { learnings }
					pagination = {
						{
							onChange: (page, pageSize) => {
								getLearnings(this.type, page, pageSize);
							},
							current: meta.page,
							pageSize: meta.pageSize,
							total: meta.total
						}
					}
					renderItem={item => (
						<List.Item
							key={item.id}
							actions={[<Checkbox key={1} checked={item.checked} onChange={(e) => selectItem(e.target.checked, item)}>Выбрать</Checkbox>]}
						>
							<List.Item.Meta
								avatar={<Avatar src={item.pict_url} />}
								title={item.title}
							/>
						</List.Item>
					)}
				/>
				{selectedLearnings.length > 0 && (
					<div className='selected-learnings-container'>
						<h3>Выбранные элементы</h3>
						<div className='selected-learnings'>
							<List
								itemLayout = 'horizontal'
								dataSource = {selectedLearnings}
								renderItem={item => (
									<List.Item
										key={item.id}
										actions={[<Icon type='delete' onClick={() => selectItem(false, item)} style={{ fontSize: '17px' }} />]}
									>
										<List.Item.Meta
											avatar={<Avatar src={item.pict_url} />}
											title={item.title}
										/>
									</List.Item>
								)}
							/>
						</div>
					</div>
				)}
			</div>
		);
	}
}


function mapStateToProps(state){
	return {
		...state.learning
	}
}

export default connect(mapStateToProps, { getLearnings, selectItem })(LearningsList);
