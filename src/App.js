import React, { Component } from 'react';
import {
	Card,
	Input,
	Icon,
	Modal,
	Button,
	Menu,
	Dropdown,
} from 'antd';
import SubordinateList from './app/SubordinateList';
import LearningsList from './app/learnings/LearningsList';
import { CoursesReportParams, AssessmentsReportParams } from './app/modals/learningsReportParams';
import LearningsActivateParams from './app/modals/learningsActivateParams';
import LearningsActivateFileParams from './app/modals/learningsActivateFileParams';
import { connect } from 'react-redux';
import { getSubordinates, selectItem, loading, error, info } from './appActions';
import { resetSelectedLearnings, assignLearnings, assignLearningsByFile } from './app/learnings/learningActions';
import { createBaseUrl } from './utils/request';
import { setCookie, getCookie } from './utils/cookie';
import moment from 'moment';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/es/locale/ru_RU';
import 'moment/locale/ru';
import './App.css';
moment.locale('ru');


const defaultDateFormat = 'YYYY-MM-DD';

function createReportUrl(action, subordinates = [], learnings = [], isAllSubordinates, isAllLearnings) {
	const u = createBaseUrl(action, {
		subordinates: subordinates.map(s => s.id).join(','),
		learnings: learnings.map(l => l.id).join(','),
		is_all_subordinates: subordinates.length === 0 || isAllSubordinates,
		is_all_learnings: learnings.length === 0 || isAllLearnings
	});
	return u;
}

class App extends Component {
	constructor(props) {
		super(props);
		this.handleChangePage = this.handleChangePage.bind(this);
		this.handleSelectItem = this.handleSelectItem.bind(this);
		this.handleToggleCoursesSettings = this.handleToggleCoursesSettings.bind(this);
		this.handleToggleAssessmentsSettings = this.handleToggleAssessmentsSettings.bind(this);
		this.handleToggleSelectedTests = this.handleToggleSelectedTests.bind(this);
		this.handleToggleSelectedCourses = this.handleToggleSelectedCourses.bind(this);
		this.handleToggleAddedInfo = this.handleToggleAddedInfo.bind(this);
		this.handleAssignLearnings = this.handleAssignLearnings.bind(this);
		this.handleToggleFromFile = this.handleToggleFromFile.bind(this);
		this.handleAssignLearningsByFile = this.handleAssignLearningsByFile.bind(this);
		this.handleGetReport = this.handleGetReport.bind(this);
		this.checkDownloadCookie = this.checkDownloadCookie.bind(this);
		this.selectAllLearnings = false;
		this.learningType = null;
		this.fileType = null;

		this.state = {
			isReport: false,
			isShowSettingsCourses: false,
			isShowSettingsAssessments: false,
			isShowTests: false,
			isShowCourses: false,
			isShowAddedInfo: false,
			isShowUploadFile: false
		}
	}

	componentDidMount() {
		this.props.getSubordinates();
	}

	checkDownloadCookie() {
		const { loading } = this.props;

		if (getCookie('downloadStarted') === 0) {
			setCookie('downloadStarted', 1, 100); //Expiration could be anything... As long as we reset the value
			loading(false);
		} else {
			setTimeout(this.checkDownloadCookie, 1000); //Re-run this function in 1 second.
		}
	}

	handleAssignLearningsByFile() {
		const { learningsActivateFileParams } = this.props;
		const data = {
			is_require_settings_passing: learningsActivateFileParams.isRequirePassing,
			selected_settings_passing_period: learningsActivateFileParams.passingPeriod,
			settings_date: learningsActivateFileParams.date ? learningsActivateFileParams.date.format(defaultDateFormat) : null
		}
		this.props.assignLearningsByFile(this.fileType, data);                                
	}

	handleToggleFromFile(type) {
		this.fileType = type;
		this.setState({
			isShowUploadFile: !this.state.isShowUploadFile
		});
	}

	handleAssignLearnings() {
		const { assignLearnings, learningsActivateParams } = this.props;
		const sDate = learningsActivateParams.date === null ? null : learningsActivateParams.date.format(defaultDateFormat);
		assignLearnings(this.learningType, this.selectAllLearnings, learningsActivateParams.isRequirePassing, learningsActivateParams.passingPeriod, sDate);
		
		this.setState({
			isShowSettingsCourses: false,
			isShowSettingsAssessments: false,
			isShowTests: false,
			isShowCourses: false,
			isShowAddedInfo: false
		});

		this.learningType = null;
		this.selectAllLearnings = false;
	}

	handleToggleAddedInfo(type, isAll) {
		this.learningType = type;
		this.selectAllLearnings = isAll;
		this.setState({
			isShowAddedInfo: !this.state.isShowAddedInfo,
			isShowTests: false,
			isShowCourses: false
		});
	}

	handleChangePage(page, pageSize) {
		this.props.getSubordinates(page, pageSize);
	}

	handleSelectItem(e, item){
		this.props.selectItem(e.target.checked, item);
	}

	handleToggleCoursesSettings(){
		this.setState({
			isShowSettingsCourses: !this.state.isShowSettingsCourses
		});
	}

	handleToggleAssessmentsSettings(){
		this.setState({
			isShowSettingsAssessments: !this.state.isShowSettingsAssessments
		});
	}


	handleToggleSelectedTests(event, isAll, isReport = false){
		this.selectAllLearnings = isAll;
		this.setState({
			isReport,
			isShowSettingsCourses: false,
			isShowSettingsAssessments: false,
			isShowTests: !this.state.isShowTests
		});

		if (!this.state.isShowTests === true) {
			this.props.resetSelectedLearnings();
		}	
	}

	handleToggleSelectedCourses(event, isAll, isReport = false){
		this.selectAllLearnings = isAll;
		this.setState({
			isReport,
			isShowSettingsCourses: false,
			isShowSettingsAssessments: false,
			isShowCourses: !this.state.isShowCourses
		});

		if (!this.state.isShowCourses === true) {
			this.props.resetSelectedLearnings();
		}
	}

	handleGetReport(action) {
		const { selectedSubordinates, selectedLearnings, learningsReportParams, loading } = this.props;

		// показываем индикатор загрузки
		setCookie('downloadStarted', 1, 100);
		loading(true);
		setTimeout(this.checkDownloadCookie, 1000);
		//

		let isAllLearnings = false;
		let isAllSubordinates = false;

		if (action === 'LearningsReport') {
			isAllLearnings = learningsReportParams.coursesParams.selectedItems === 1;
			isAllSubordinates = learningsReportParams.coursesParams.selectedCollaborators === 1;
		} else if (action === 'TestLearningsReport') {
			isAllLearnings = learningsReportParams.assessmentsParams.selectedItems === 1;
			isAllSubordinates = learningsReportParams.assessmentsParams.selectedCollaborators === 1;
		}

		const url = createReportUrl(action, selectedSubordinates, selectedLearnings, isAllSubordinates, isAllLearnings);
		const a = document.createElement('a');
		a.setAttribute('href', url);
		document.body.appendChild(a);
		a.click();
		
		this.setState({
			isShowSettingsCourses: false,
			isShowSettingsAssessments: false,
			isShowTests: false,
			isShowCourses: false,
			isShowAddedInfo: false
		});
		this.learningType = null;
		this.selectAllLearnings = false;
	}

	render() {
		const {
			ui,
			meta,
			subordinates,
			selectedSubordinates,
			getSubordinates,
			loading,
			error,
			info,
			learningsCount,
			learningsReportParams
		} = this.props;
		const {
			isShowSettingsCourses,
			isShowSettingsAssessments,
			isShowTests,
			isShowCourses,
			isShowAddedInfo,
			isShowUploadFile
		} = this.state;

		return (
			<ConfigProvider locale={ruRU}>
				<div className='App'>
					<Modal
						title={null}
						visible={ui.isLoading}
						footer={null}
					>
						Подождите, идет загрузка...
					</Modal>
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
						{ui.info.split('\n').map((item, index) => <div key={index}>{item}</div>)}
					</Modal>
					<Card
						className='subordinates-card'
						title='Список ваших подчиненных'
						extra={
							<div>
								<div className='subordinates-card__menu'>
									<Dropdown className='subordinates-card__menu_item' overlay={(
										<Menu>
											<Menu.Item onClick={ e => this.handleToggleSelectedCourses(e, true) }>Всем сотрудникам</Menu.Item>
											<Menu.Item onClick={ e => this.handleToggleSelectedCourses(e) }>Выбранным сотрудникам ({selectedSubordinates.length})</Menu.Item>
											<Menu.Item onClick={ () => this.handleToggleFromFile('courses') }>Сотрудникам из файла</Menu.Item>
										</Menu>
									)}>
										<span className='subordinates-card__menu_item-link'>
											Назначить курсы <Icon type='down' />
										</span>
									</Dropdown>
									<Dropdown className='subordinates-card__menu_item' overlay={(
										<Menu>
											<Menu.Item onClick={ e => this.handleToggleSelectedTests(e, true) }>Всем сотрудникам</Menu.Item>
											<Menu.Item onClick={ e => this.handleToggleSelectedTests(e) }>Выбранным сотрудникам ({selectedSubordinates.length})</Menu.Item>
											<Menu.Item onClick={ () => this.handleToggleFromFile('assessments') }>Сотрудникам из файла</Menu.Item>
										</Menu>
									)}>
										<span className='subordinates-card__menu_item-link'>
											Назначить тесты <Icon type='down' />
										</span>
									</Dropdown>
									<Dropdown className='subordinates-card__menu_item' overlay={(
										<Menu>
											<Menu.Item onClick={ this.handleToggleCoursesSettings }>По курсам</Menu.Item>
											<Menu.Item onClick={ this.handleToggleAssessmentsSettings }>По тестам</Menu.Item>
											<Menu.Item><a href={ createReportUrl('EventsReport') }>По мероприятиям</a></Menu.Item>
										</Menu>
									)}>
										<span className='subordinates-card__menu_item-link'>
											Скачать отчет <Icon type='down' />
										</span>
									</Dropdown>
								</div>
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

					<CoursesReportParams
						title='Выберите параметры курсов'
						visible={isShowSettingsCourses}
						onOk={(e) => learningsReportParams.coursesParams.selectedItems === 1 ? this.handleGetReport('LearningsReport') : this.handleToggleSelectedCourses(e, false, true)}
						onCancel={this.handleToggleCoursesSettings}
						selectedSubordinates={selectedSubordinates}
					/>
					<AssessmentsReportParams
						title='Выберите параметры тестов'
						visible={isShowSettingsAssessments}
						onOk={(e) => learningsReportParams.assessmentsParams.selectedItems === 1 ? this.handleGetReport('TestLearningsReport') : this.handleToggleSelectedTests(e, false, true)}
						onCancel={this.handleToggleAssessmentsSettings}
						selectedSubordinates={selectedSubordinates}
					/>
					
					{isShowTests && <Modal
						width = {820}
						title='Тесты'
						okText='Выбрать'
						okButtonProps={{
							disabled: learningsCount === 0
						}}
						cancelText='Отмена'
						visible
						onCancel={this.handleToggleSelectedTests}
						onOk={() => {
							return this.state.isReport ? this.handleGetReport('TestLearningsReport'): this.handleToggleAddedInfo('Assessments', this.selectAllLearnings)
						}}
					>
						<LearningsList type='Assessments' />
					</Modal>}
					{isShowCourses && <Modal
						width = {820}
						title='Курсы'
						okText='Выбрать'
						okButtonProps={{
							disabled: learningsCount === 0
						}}
						cancelText='Отмена'
						visible
						onCancel={this.handleToggleSelectedCourses}
						onOk={() => {
							return this.state.isReport ? this.handleGetReport('LearningsReport') : this.handleToggleAddedInfo('Courses', this.selectAllLearnings)
						}}
					>
						<LearningsList type='Courses' />
					</Modal>}

					<LearningsActivateParams
						width = {620}
						title='Дополнительные настройки'
						okText='Назначить'
						cancelText='Отмена'
						visible={isShowAddedInfo}
						onCancel={this.handleToggleAddedInfo}
						onOk={this.handleAssignLearnings}
					/>

					{isShowUploadFile && <LearningsActivateFileParams
						width={620}
						visible
						title='Назначение из файла'
						onOk={this.handleAssignLearningsByFile}
						onCancel={this.handleToggleFromFile}
						footer={null}
						fileType={this.fileType}
					/>}
				</div>
			</ConfigProvider>
		);
	}
}
function mapStateToProps(state){
	return {
		...state.app,
		learningsActivateParams: state.learningsActivateParams,
		learningsReportParams: state.learningsReportParams,
		learningsActivateFileParams: state.learningsActivateFileParams,
		selectedLearnings: state.learning.selectedLearnings,
		learningsCount: state.learning.selectedLearnings.length
	}
}
export default connect(mapStateToProps, { getSubordinates, selectItem, resetSelectedLearnings, assignLearnings, assignLearningsByFile, loading, error, info })(App);