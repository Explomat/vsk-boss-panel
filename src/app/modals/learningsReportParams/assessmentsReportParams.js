import React from 'react';
import { connect } from 'react-redux';
import { changeAssessmentsCollaborators, changeAssessmentsItems } from './learningsReportParamsActions';
import { Modal, Button, Radio } from 'antd';
import './learningsReportParams.css';

const AssessmentsReportParams = (props) => (
	<Modal
		title={props.title}
		visible={props.visible}
		onCancel={props.onCancel}
		footer={
			<div>
				<Button onClick={props.onCancel} key='cancel'>Отмена</Button>
				<Button type='primary' onClick={props.onOk} key='ok'>Готово</Button>
			</div>
		}
	>
		<Radio.Group className='radio-group' value={props.assessmentsParams.selectedCollaborators} onChange={e => props.changeAssessmentsCollaborators(e.target.value)}>
			<Radio className='radio-group__item' value={1}>Все сотрудники</Radio>
			<Radio className='radio-group__item' value={2}>Выбранные сотрудники ({props.selectedSubordinates.length})</Radio>
		</Radio.Group>
		<Radio.Group className='radio-group' value={props.assessmentsParams.selectedItems} onChange={e => props.changeAssessmentsItems(e.target.value)}>
			<Radio className='radio-group__item' value={1}>Все тесты</Radio>
			<Radio className='radio-group__item' value={2}>Выбрать тесты</Radio>
		</Radio.Group>
	</Modal>
);

function mapStateToProps(state){
	return {
		...state.learningsReportParams
	}
}

export default connect(mapStateToProps, { changeAssessmentsCollaborators, changeAssessmentsItems })(AssessmentsReportParams);
