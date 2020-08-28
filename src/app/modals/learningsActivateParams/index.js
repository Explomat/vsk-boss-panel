import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeRequirePassing, changeSelectedPeriod, changeDateSettings } from './learningsActivateParamsActions';
import { Modal, Checkbox, Radio, DatePicker, Alert } from 'antd';
import './learningsActivateParams.css';

class LearningsActivateParams extends Component {

	constructor(props) {
		super(props);

		this.handleChangeRequirePassing = this.handleChangeRequirePassing.bind(this);
		this.handleChangeSelectedPeriod = this.handleChangeSelectedPeriod.bind(this);
		this.handleChangeDateSettings = this.handleChangeDateSettings.bind(this);
	}

	handleChangeRequirePassing(e) {
		this.props.changeRequirePassing(e.target.checked);
	}

	handleChangeSelectedPeriod(e) {
		this.props.changeSelectPeriod(e.target.value);
	}

	handleChangeDateSettings(date) {
		this.props.changeDateSettings(date);
	}

	render() {
		const { isRequirePassing, passingPeriod, date, ...props } = this.props;

		return (
			<Modal
				{...props}
				okButtonProps={{
					disabled: (passingPeriod === 1 && date === null)
				}}
			>
				<div className='learnings-settings'>
					<Checkbox
						className='learnings-settings__require-passing'
						checked={isRequirePassing}
						onChange={this.handleChangeRequirePassing}
					>
						<span>Обязательный курс/тест нужно пройти за указанный в настройках срок?</span>
						<i className='learnings-settings__passing-require-descr'>Если курс не пройден вовремя – вы получите соответствующее уведомление. В отчете по курсам указывается вовремя ли завершил обязательный курс сотрудник.</i>
					</Checkbox>
					<div>
						<Radio.Group className='learnings-settings__passing-period' value={passingPeriod} onChange={this.handleChangeSelectedPeriod}>
							<Radio value={1}>Выставить срок прохождения</Radio>
							<Radio value={2}>Выставить срок прохождения 3 недели</Radio>
						</Radio.Group>
						{passingPeriod === 1 && <DatePicker defaultValue={date} onChange={this.handleChangeDateSettings}/>}
						{passingPeriod === 1
							&& date === null
							&& <Alert className='learnings-period-message' type='info' message='Укажите дату прохождения' />
						}
					</div>
				</div>
			</Modal>
		);
	}
}

function mapStateToProps(state){
	return {
		...state.learningsActivateParams
	}
}

export default connect(mapStateToProps, { changeRequirePassing, changeSelectedPeriod, changeDateSettings })(LearningsActivateParams);
