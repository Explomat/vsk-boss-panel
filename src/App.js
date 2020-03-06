import React, { Component } from 'react';
import {
	Alert,
	Card,
	Input,
	Icon,
	Modal,
	Button,
	List,
	Avatar,
	Menu,
	Dropdown,
	Checkbox,
	DatePicker,
	Radio,
	Upload
} from 'antd';
//import { FilePond } from 'react-filepond';
import SubordinateList from './app/SubordinateList';
import LearningsList from './app/learnings/LearningsList';
import { connect } from 'react-redux';
import { getSubordinates, selectItem, onFileUploaded, error, info } from './appActions';
import { resetSelectedLearnings, assignLearnings } from './app/learnings/learningActions';
import { createBaseUrl } from './utils/request';
import './App.css';
import moment from 'moment';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/es/locale/ru_RU';
import 'moment/locale/ru';
moment.locale('ru');

/*import locale from 'antd/es/date-picker/locale/ru_RU';
moment.locale('ru');*/

/*const ruLocal = {
  "lang": {
    "locale": "ru_RU",
    "placeholder": "Выберите срок прохождения",
    "rangePlaceholder": ["Начальная дата", "Конечная дата"],
    "today": "Сегодня",
    "now": "Сейчас",
    "backToToday": "Вернуться",
    "ok": "Ok",
    "clear": "Очистить",
    "month": "Месяц",
    "year": "Год",
    "timeSelect": "Выбранное время",
    "dateSelect": "Выбранная дата",
    "monthSelect": "Выберите месяц",
    "yearSelect": "Выберите год",
    "decadeSelect": "Выберите десятилетие",
    "yearFormat": "YYYY",
    "dateFormat": "DD/MM/YYYY",
    "dayFormat": "D",
    "dateTimeFormat": "DD/MM/YYYY HH:mm:ss",
    "monthFormat": "MMMM",
    "monthBeforeYear": true,
    "previousMonth": "Предыдущий месяц (PageUp)",
    "nextMonth": "Следующий месяц (PageDown)",
    "previousYear": "Предыдущий год (Control + left)",
    "nextYear": "Следующий год (Control + right)",
    "previousDecade": "Предыдущее десятилетие",
    "nextDecade": "Следующее десятилетие",
    "previousCentury": "Предыдущий век",
    "nextCentury": "Следующий век"
  },
  "timePickerLocale": {
    "placeholder": "Выберите время"
  },
  "dateFormat": "",
  "dateTimeFormat": "DD-MM-YYYY HH:mm:ss",
  "weekFormat": "YYYY-wo",
  "monthFormat": "YYYY-MM"
}*/

const defaultDateFormat = 'YYYY-MM-DD';

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
		this.handleToggleFromFile = this.handleToggleFromFile.bind(this);

		this.selectAllLearnings = false;
		this.learningType = null;
		this.fileType = null;

		this.state = {
			isShowItems: false,
			isShowTests: false,
			isShowCourses: false,
			isShowAddedInfo: false,
			isRequireSettingsPassing: false,
			selectedSettingsPassingPeriod: 2,
			settingsDate: null,
			isShowUploadFile: false
		}
	}

	componentDidMount() {
		this.props.getSubordinates();
	}

	handleToggleFromFile(type) {
		this.fileType = type;

		this.props.onFileUploaded({
			error: '',
			count: 0,
			isUpload: false
		});

		this.setState({
			isShowUploadFile: !this.state.isShowUploadFile
		});
	}

	onAssignLearnings() {
		const { assignLearnings } = this.props;
		const {
			isRequireSettingsPassing,
			selectedSettingsPassingPeriod,
			settingsDate
		} = this.state;

		const sDate = settingsDate === null ? null : settingsDate.format(defaultDateFormat);
		assignLearnings(this.learningType, this.selectAllLearnings, isRequireSettingsPassing, selectedSettingsPassingPeriod, sDate);

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
			user,
			meta,
			subordinates,
			selectedSubordinates,
			selectItem,
			getSubordinates,
			error,
			info,
			learningsCount,
			onFileUploaded,
			fileUploaded
		} = this.props;

		const {
			isShowItems,
			isShowTests,
			isShowCourses,
			isShowAddedInfo,
			isRequireSettingsPassing,
			selectedSettingsPassingPeriod,
			settingsDate,
			isShowUploadFile
		} = this.state;

		return (
			<ConfigProvider locale={ruRU}>
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
													{user.is_admin && <Menu.SubMenu title='Назначить из файла'>
														<Menu.Item onClick={() => this.handleToggleFromFile('assessments')}>Тесты</Menu.Item>
														<Menu.Item onClick={() => this.handleToggleFromFile('courses')}>Курсы</Menu.Item>
													</Menu.SubMenu>}
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
								width = {620}
								title='Дополнительные настройки'
								okText='Назначить'
								okButtonProps={{
									disabled: (selectedSettingsPassingPeriod === 1 && settingsDate === null)
								}}
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
											<Radio value={2}>Выставить срок прохождения 3 недели</Radio>
										</Radio.Group>
										{selectedSettingsPassingPeriod === 1 && <DatePicker defaultValue={settingsDate} onChange={this.handleChangeDateSettings}/>}
										{selectedSettingsPassingPeriod === 1
											&& settingsDate === null
											&& <Alert className='learnings-period-message' type='info' message='Укажите дату прохождения' />
										}
									</div>
								</div>
							</Modal>
							<Modal
								width = {620}
								title='Выберите файл'
								visible={isShowUploadFile}
								onCancel={this.handleToggleFromFile}
								footer={null}
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
											<Radio value={2}>Выставить срок прохождения 3 недели</Radio>
										</Radio.Group>
										{selectedSettingsPassingPeriod === 1 && <DatePicker defaultValue={settingsDate} onChange={this.handleChangeDateSettings}/>}
										{selectedSettingsPassingPeriod === 1
											&& settingsDate === null
											&& <Alert className='learnings-period-message' type='info' message='Укажите дату прохождения'/>
										}
									</div>
								</div>

								<Upload
									accept='.xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
									name='file'
									showUploadList={false}
									action={
										this.fileType === 'assessments' ?
											`${createBaseUrl('ActivateAssementsByFile')}`
											: `${createBaseUrl('ActivateCoursesByFile')}`
									}
									onChange = {({ file }) => {
										if (file.response) {
											onFileUploaded(file.response.data);
										}
									}}
									data={{
										is_require_settings_passing: isRequireSettingsPassing,
										selected_settings_passing_period: selectedSettingsPassingPeriod,
										settings_date: settingsDate ? settingsDate.format(defaultDateFormat) : null
									}}
								>
									<Button disabled={(selectedSettingsPassingPeriod === 1 && settingsDate === null)} className='learnings-upload-file'>
										<Icon type='upload' /> Загрузить файл и назначить
									</Button>
								</Upload>
								{fileUploaded.isUpload &&
									<Alert className='learnings-upload-file-message' message={fileUploaded.error ? (fileUploaded.error + '\r\nНазначено: ' + fileUploaded.count) : 'Назначено: ' + fileUploaded.count} type='info' />
								}
							</Modal>
						</div>
					)}
				</div>
			</ConfigProvider>
		);
	}
}

function mapStateToProps(state){
	return {
		...state.app,
		learningsCount: state.learning.selectedLearnings.length
	}
}

export default connect(mapStateToProps, { getSubordinates, selectItem, resetSelectedLearnings, assignLearnings, onFileUploaded, error, info })(App);
