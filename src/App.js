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
    Radio
} from 'antd';
import SubordinateList from './app/SubordinateList';
import LearningsList from './app/learnings/LearningsList';
import UploadFile from './components/uploadFile';
import { connect } from 'react-redux';
import { getSubordinates, selectItem, onFileUploaded, resetFileUploaded, error, info } from './appActions';
import { resetSelectedLearnings, assignLearnings, assignLearningsByFile } from './app/learnings/learningActions';
import { createBaseUrl } from './utils/request';
import './App.css';
import moment from 'moment';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/es/locale/ru_RU';
import 'moment/locale/ru';
moment.locale('ru');
const defaultDateFormat = 'YYYY-MM-DD';

function createReportUrl(action, subordinates = [], learnings = []) {
    //console.log('subordinates: ' + JSON.stringify(subordinates), 'learnings: ' + JSON.stringify(learnings));
    const u = createBaseUrl(action, {
        subordinates: subordinates.map(s => s.id).join(','),
        learnings: learnings.map(l => l.id).join(','),
        is_all_subordinates: subordinates.length === 0,
        is_all_learnings: learnings.length === 0
    });
    //console.log(u);
    return u;
}
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
        this.handleAssignLearnings = this.handleAssignLearnings.bind(this);
        this.handleGetReport = this.handleGetReport.bind(this);
        this.selectAllLearnings = false;
        this.learningType = null;
        this.fileType = null;
        this.state = {
            isReport: false,
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
    handleAssignLearnings() {
        const { isRequireSettingsPassing, selectedSettingsPassingPeriod, settingsDate } = this.state;
        const data={
            is_require_settings_passing: isRequireSettingsPassing,
            selected_settings_passing_period: selectedSettingsPassingPeriod,
            settings_date: settingsDate ? settingsDate.format(defaultDateFormat) : null
        }
        this.props.assignLearningsByFile(this.fileType, data);                                
    }
    handleToggleFromFile(type) {
        this.fileType = type;
        if (!this.state.isShowUploadFile) {
            this.props.resetFileUploaded();
        }
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
    handleToggleSelectedTests(event, isAll, isReport = false){
        this.selectAllLearnings = isAll;
        this.setState({
            isReport,
            isShowItems: false,
            isShowTests: !this.state.isShowTests
        });
        this.props.resetSelectedLearnings();
    }
    handleToggleSelectedCourses(event, isAll, isReport = false){
        this.selectAllLearnings = isAll;
        this.setState({
            isReport,
            isShowItems: false,
            isShowCourses: !this.state.isShowCourses
        });
        this.props.resetSelectedLearnings();
    }
    handleGetReport() {
        const { isShowTests, isShowCourses } = this.state;
        const { selectedSubordinates, selectedLearnings } = this.props;
        let action = '';
        if (isShowTests) {
            action = 'TestLearningsReport';
        }
        if (isShowCourses) {
            action = 'LearningsReport';
        }

        const url = createReportUrl(action, selectedSubordinates, selectedLearnings);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        document.body.appendChild(a);
        a.click();
        //assignLearnings(this.learningType, this.selectAllLearnings);
        this.setState({
            isShowItems: false,
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
                                {ui.info.split('\n').map((item, index) => <div key={index}>{item}</div>)}
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
                                                        <Menu.SubMenu title='По тестам'>
                                                            {/*<Menu.Item><a href={`${createBaseUrl('TestLearningsReport')}`}>По всем сотрудникам</a></Menu.Item>
                                                            <Menu.Item><a href={`${createBaseUrl('TestLearningsReport')}`}>По выбранным сотрудникам ({selectedSubordinates.length})</a></Menu.Item>*/}
                                                            <Menu.Item onClick={ e => this.handleToggleSelectedTests(e, true, true)}>По всем сотрудникам</Menu.Item>
                                                            <Menu.SubMenu title={`По выбранным сотрудникам (${selectedSubordinates.length})`}>
                                                                <Menu.Item><a href={createReportUrl('TestLearningsReport', selectedSubordinates)}>По всем тестам</a></Menu.Item>
                                                                <Menu.Item onClick={ e => this.handleToggleSelectedTests(e, false, true)}>Выбрать тесты</Menu.Item>
                                                            </Menu.SubMenu>
                                                            <Menu.Item><a href={`${createReportUrl('TestLearningsReport')}`}>По всем тестам и сотрудникам</a></Menu.Item>
                                                        </Menu.SubMenu>
                                                        <Menu.SubMenu title='По курсам'>
                                                            {/*<Menu.Item><a href={`${createBaseUrl('LearningsReport')}`}>По всем сотрудникам</a></Menu.Item>
                                                            <Menu.Item><a href={`${createBaseUrl('LearningsReport')}`}>По выбранным сотрудникам ({selectedSubordinates.length})</a></Menu.Item>*/}
                                                            <Menu.Item onClick={ e => this.handleToggleSelectedCourses(e, true, true)}>По всем сотрудникам</Menu.Item>
                                                            <Menu.SubMenu title={`По выбранным сотрудникам (${selectedSubordinates.length})`}>
                                                                <Menu.Item><a href={createReportUrl('LearningsReport', selectedSubordinates)}>По всем курсам</a></Menu.Item>
                                                                <Menu.Item onClick={ e => this.handleToggleSelectedCourses(e, false, true)}>Выбрать курсы</Menu.Item>
                                                            </Menu.SubMenu>
                                                            <Menu.Item><a href={`${createReportUrl('LearningsReport')}`}>По всем курсам и сотрудникам</a></Menu.Item>
                                                        </Menu.SubMenu>
                                                        <Menu.Item><a href={createReportUrl('EventsReport')}>По мероприятиям</a></Menu.Item>
                                                    </Menu.SubMenu>
                                                </Menu>
                                            )}>
                                            <a className='ant-dropdown-link'>
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
                                okText='Выбрать'
                                okButtonProps={{
                                    disabled: learningsCount === 0
                                }}
                                cancelText='Отмена'
                                visible={isShowTests}
                                onCancel={this.handleToggleSelectedTests}
                                onOk={() => {
                                    return this.state.isReport ? this.handleGetReport(): this.handleToggleAddedInfo('Assessments', this.selectAllLearnings)
                                }}
                            >
                                <LearningsList type='Assessments' />
                            </Modal>
                            <Modal
                                width = {820}
                                title='Курсы'
                                okText='Выбрать'
                                okButtonProps={{
                                    disabled: learningsCount === 0
                                }}
                                cancelText='Отмена'
                                visible={isShowCourses}
                                onCancel={this.handleToggleSelectedCourses}
                                onOk={() => {
                                    return this.state.isReport ? this.handleGetReport() : this.handleToggleAddedInfo('Courses', this.selectAllLearnings)
                                }}
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
                                        <span>Обязательный курс/тест нужно пройти за указанный в настройках срок?</span>
                                        <i className='learnings-settings__passing-require-descr'>Если курс не пройден вовремя – вы получите соответствующее уведомление. В отчете по курсам указывается вовремя ли завершил обязательный курс сотрудник.</i>
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
                            {isShowUploadFile && <Modal
                                width = {620}
                                visible={true}
                                title='Назначение из файла'
                                onCancel={this.handleToggleFromFile}
                                footer={null}
                            >
                                <div className='learnings-settings'>
                                    <Checkbox
                                        className='learnings-settings__require-passing'
                                        checked={isRequireSettingsPassing}
                                        onChange={this.handleChangeRequirePassing}
                                    >
                                        <span>Обязательный курс/тест нужно пройти за указанный в настройках срок?</span>
                                        <i className='learnings-settings__passing-require-descr'>Если курс не пройден вовремя – вы получите соответствующее уведомление. В отчете по курсам указывается вовремя ли завершил обязательный курс сотрудник.</i>
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
                                <UploadFile
                                    url={
                                        this.fileType === 'assessments' ?
                                            `${createBaseUrl('UploadAssementsFile')}`
                                            : `${createBaseUrl('UploadCoursesFile')}`
                                    }
                                    onFileUploaded={onFileUploaded}
                                    onRemove={this.props.resetFileUploaded}
                                    disabled={!fileUploaded.isUpload}
                                />
                                {
                                    fileUploaded.isUpload && (
                                        <div>
                                            {fileUploaded.errors && <Alert type='error' message={fileUploaded.errors.split('\n').map((item, index) => <div key={index}>{item}</div>)} />}
                                            <Alert type='info' message={(
                                                <div>
                                                    <div>Количество сотрудников: {fileUploaded.collaboratorsCount}</div>
                                                    <div>Количество курсов / тестов: {fileUploaded.learningsCount}</div>
                                                </div>
                                            )} />
                                            {!fileUploaded.errors &&
                                                <Button
                                                    type='primary'
                                                    onClick={this.handleAssignLearnings}
                                                    style={{ marginTop: 16 }}
                                                >
                                                    Назначить
                                                </Button>
                                            }
                                        </div>
                                    )
                                }
                            </Modal>}
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
        selectedLearnings: state.learning.selectedLearnings,
        learningsCount: state.learning.selectedLearnings.length
    }
}
export default connect(mapStateToProps, { getSubordinates, selectItem, resetSelectedLearnings, assignLearnings, assignLearningsByFile, onFileUploaded, resetFileUploaded, error, info })(App);