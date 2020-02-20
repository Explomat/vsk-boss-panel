import React, { Component } from 'react';
import { Card, Input, Icon, Modal, Button, List, Avatar, Menu, Dropdown, Checkbox, DatePicker, Radio } from 'antd';
import SubordinateList from './app/SubordinateList';
import LearningsList from './app/learnings/LearningsList';
import { connect } from 'react-redux';
import { getSubordinates, selectItem, error, info } from './appActions';
import { resetSelectedLearnings, assignLearnings } from './app/learnings/learningActions';
import { createBaseUrl } from './utils/request';
import './App.css';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/ru_RU';

class App extends Component {

	constructor(props) {
		super(props);

		this.handleChangePage = this.handleChangePage.bind(this);
		this.handleSelectItem = this.handleSelectItem.bind(this);
		this.handleToggleSelectedItems = this.handleToggleSelectedItems.bind(this);
		this.handleToggleSelectedTests = this.handleToggleSelectedTests.bind(this);
		this.handleToggleSelectedCourses = this.handleToggleSelectedCourses.bind(this);
		this.handleToggleAddedInfo = this.handleToggleAddedInfo.bind(this);
		this.handleChangeRequirePassing = this.handleChangeRequirePassing.bind(this);
		this.handleChangeSelectPeriond = this.handleChangeSelectPeriond.bind(this);
		this.handleChangeDateSettings = this.handleChangeDateSettings.bind(this);
		this.onAssignLearnings = this.onAssignLearnings.bind(this);

		this.selectAllLearnings = false;
		this.learningType = null;

		this.state = {
			isShowItems: false,
			isShowTests: false,
			isShowCourses: false,
			isShowAddedInfo: false,
			isRequireSettingsPassing: true,
			selectedSettingsPassingPeriod: 1,
			settingsDate: moment(new Date(), 'DD.MM.YYYY')
		}
	}

	componentDidMount() {
		this.props.getSubordinates();
	}

	onAssignLearnings() {
		const { assignLearnings } = this.props;
		const {
			isRequireSettingsPassing,
			selectedSettingsPassingPeriod,
			settingsDate
		} = this.state;

		assignLearnings(this.learningType, this.selectAllLearnings, isRequireSettingsPassing, selectedSettingsPassingPeriod, settingsDate);

		this.setState({
			isShowItems: false,
			isShowTests: false,
			isShowCourses: false,
			isShowAddedInfo: false
		});
		this.learningType = null;
		this.selectAllLearnings = false;
	}

	handleChangeDateSettings(date) {
		this.setState({
			settingsDate: date
		});
	}

	handleChangeSelectPeriond(e) {
		this.setState({
			selectedSettingsPassingPeriod: e.target.value
		});
	}

	handleChangeRequirePassing(e) {
		this.setState({
			isRequireSettingsPassing: e.target.checked
		});
	}

	handleToggleAddedInfo(type, isAll) {
		this.learningType = type;
		this.selectAllLearnings = isAll;

		this.setState({
			isShowAddedInfo: !this.state.isShowAddedInfo
		});
	}

	handleChangePage(page, pageSize) {
		this.props.getSubordinates(page, pageSize);
	}

	handleSelectItem(e, item){
		this.props.selectItem(e.target.checked, item);
	}

	handleToggleSelectedItems(){
		this.setState({
			isShowItems: !this.state.isShowItems
		});
	}

	handleToggleSelectedTests(event, isAll){
		this.selectAllLearnings = isAll;

		this.setState({
			isShowItems: false,
			isShowTests: !this.state.isShowTests
		});

		this.props.resetSelectedLearnings();
	}

	handleToggleSelectedCourses(event, isAll){
		this.selectAllLearnings = isAll;

		this.setState({
			isShowItems: false,
			isShowCourses: !this.state.isShowCourses
		});

		this.props.resetSelectedLearnings();
	}

	render() {
		const {
			ui,
			meta,
			subordinates,
			selectedSubordinates,
			selectItem,
			getSubordinates,
			error,
			info,
			learningsCount
		} = this.props;
		const { isShowItems, isShowTests, isShowCourses, isShowAddedInfo, isRequireSettingsPassing, selectedSettingsPassingPeriod, settingsDate } = this.state;

		return (
			<div className='App'>
				{ ui.isLoading ? <div>Loading</div> : (
					<div>
						<Modal
							title='Ошибка'
							onOk={() => error('')}
							onCancel={() => error('')}
							visible={!!ui.error}
							footer={
								<Button onClick={() => error('')}>
									Ok
								</Button>
							}
						>
							{ui.error}
						</Modal>
						<Modal
							title='Сообщение'
							onOk={() => info('')}
							onCancel={() => info('')}
							visible={!!ui.info}
							footer={
								<Button onClick={() => info('')}>
									Ok
								</Button>
							}
						>
							{ui.info}
						</Modal>
						<Card
							className='subordinates-card'
							title='Список ваших подчиненных'
							extra={
								<div>
									<Dropdown
										className='subordinates-card__menu'
										overlay={(
											<Menu>
												<Menu.Item onClick={this.handleToggleSelectedItems}>Назначить выбранным ({selectedSubordinates.length})</Menu.Item>
												<Menu.SubMenu title='Назначить всем'>
													<Menu.Item onClick={ e => this.handleToggleSelectedTests(e, true)}>Тесты</Menu.Item>
													<Menu.Item onClick={ e => this.handleToggleSelectedCourses(e, true)}>Курсы</Menu.Item>
												</Menu.SubMenu>
												<Menu.SubMenu
													title={
														<span>
															<Icon type='file-excel' />
															<span>Скачать отчет</span>
														</span>
													}
												>
													<Menu.Item><a href={`${createBaseUrl('TestLearningsReport')}`}>По тестам</a></Menu.Item>
													<Menu.Item><a href={`${createBaseUrl('LearningsReport')}`}>По курсам</a></Menu.Item>
												</Menu.SubMenu>
											</Menu>
										)}>
										<a className='ant-dropdown-link' href='#'>
											Действия <Icon type='down' />
										</a>
									</Dropdown>
									<div style={{ display: 'inline-block' }}>
										<Input
											allowClear
											placeholder='Поиск'
											prefix={<Icon type='search' style={{ color: 'rgba(0,0,0,.25)' }} />}
											onPressEnter={(e) => getSubordinates(1, null, e.target.value)}
										/>
									</div>
								</div>
							}
						>
							<SubordinateList
								subordinates={subordinates}
								meta={meta}
								onChange={this.handleChangePage}
								onSelect={this.handleSelectItem}
								isLoading={ui.isLoadingList}
							/>
						</Card>
						<Modal
							title='Добавленные сотрудники'
							visible={isShowItems}
							onCancel={this.handleToggleSelectedItems}
							footer={
								selectedSubordinates.length > 0 && (<div>
									<Button onClick={this.handleToggleSelectedTests} key='tests'>Назначить тесты</Button>,
									<Button onClick={this.handleToggleSelectedCourses} key='courses'>Назначить курсы</Button>
								</div>)
							}
						>
							<List
								itemLayout = 'horizontal'
								dataSource = {selectedSubordinates}
								renderItem={item => (
									<List.Item
										key={item.id}
										actions={[<Icon type='delete' onClick={() => selectItem(false, item)} style={{ fontSize: '17px' }} />]}
									>
										<List.Item.Meta
											avatar={<Avatar src={item.pict_url} />}
											title={item.fullname}
											description={item.position_name}
										/>
									</List.Item>
								)}
							/>
						</Modal>
						<Modal
							width = {820}
							title='Тесты'
							okText='Назначить'
							okButtonProps={{
								disabled: learningsCount === 0
							}}
							cancelText='Отмена'
							visible={isShowTests}
							onCancel={this.handleToggleSelectedTests}
							onOk={() => this.handleToggleAddedInfo('Assessments', this.selectAllLearnings)}
						>
							<LearningsList type='Assessments' />
						</Modal>
						<Modal
							width = {820}
							title='Курсы'
							okText='Назначить'
							okButtonProps={{
								disabled: learningsCount === 0
							}}
							cancelText='Отмена'
							visible={isShowCourses}
							onCancel={this.handleToggleSelectedCourses}
							onOk={() => this.handleToggleAddedInfo('Courses', this.selectAllLearnings)}
						>
							<LearningsList type='Courses' />
						</Modal>
						<Modal
							width = {820}
							title='Дополнительные настройки'
							okText='Назначить'
							cancelText='Отмена'
							visible={isShowAddedInfo}
							onCancel={this.handleToggleAddedInfo}
							onOk={() => this.onAssignLearnings()}
						>
							<div className='learnings-settings'>
								<Checkbox
									className='learnings-settings__require-passing'
									checked={isRequireSettingsPassing}
									onChange={this.handleChangeRequirePassing}
								>
									Обязательный ли курс/тест для прохождения?
								</Checkbox>
								<div>
									<Radio.Group className='learnings-settings__passing-period' value={selectedSettingsPassingPeriod} onChange={this.handleChangeSelectPeriond}>
										<Radio value={1}>Выставить срок прохождения</Radio>
										<Radio value={2}>Оставить срок по умолчанию, заданный в карточке курса</Radio>
									</Radio.Group>
									{selectedSettingsPassingPeriod === 1 && <DatePicker defaultValue={settingsDate} onChange={this.handleChangeDateSettings} locale={locale}/>}
								</div>
							</div>
						</Modal>
					</div>
				)}
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		...state.app,
		learningsCount: state.learning.selectedLearnings.length
	}
}

export default connect(mapStateToProps, { getSubordinates, selectItem, resetSelectedLearnings, assignLearnings, error, info })(App);
