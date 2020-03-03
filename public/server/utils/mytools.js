function activate_test_to_person (oPersonID,_test_id,_event_id,_person_doc,_test_doc,_event_doc,_duration,_start_learning_date,dtLastLearningDateParam,_group_id,_education_plan_id,bSkipDismissedParam) {
	personID = OptInt( oPersonID );
	bObjectParam = personID == undefined;
	if ( bObjectParam )
	{
		personID = Int( oPersonID.iPersonID );
		assessmentID = Int( oPersonID.iAssessmentID );
		eventID = OptInt( oPersonID.GetOptProperty( 'iEventID' ), null );
		dtLastLearningDateParam = oPersonID.GetOptProperty( 'dtLastLearningDate', '' );
		bSkipDismissedParam = oPersonID.GetOptProperty( 'bSkipDismissed' ) == true;
		if ( bSkipDismissedParam )
			personDoc = oPersonID.GetOptProperty( 'teCollaborator', OpenDoc( UrlFromDocID( personID ) ).TopElem );
	}
	else
	{
		assessmentID = Int( _test_id );
		try
		{
			eventID = OptInt( _event_id, null );
		}
		catch ( err )
		{
			eventID = null;
		}
		try
		{
			bSkipDismissedParam = bSkipDismissedParam == true;
		}
		catch ( err )
		{
			bSkipDismissedParam = false;
		}
		if ( bSkipDismissedParam )
		{
			try
			{
				if ( _person_doc == null || _person_doc == '' || _person_doc == undefined )
					throw 'no_doc';

				personDoc = _person_doc;
			}
			catch ( err )
			{
				personDoc = OpenDoc( UrlFromDocID( personID ) ).TopElem;
			}
		}
	}

	if ( bSkipDismissedParam && personDoc.is_dismiss )
		return null;

	firsActiveLearning = ArrayOptFirstElem( XQuery( 'for $elem in active_test_learnings where $elem/person_id = ' + personID + ' and $elem/assessment_id = ' + assessmentID + ' return $elem' ) );
	if ( firsActiveLearning != undefined )
		return firsActiveLearning.id;

	try
	{
		if ( dtLastLearningDateParam != '' )
		{
			sWhere = dtLastLearningDateParam == null ? '' : ' and $elem/last_usage_date &gt; date(\'' + dtLastLearningDateParam + '\')';
			learningArray = XQuery( 'for $elem in test_learnings where $elem/person_id = ' + personID + ' and $elem/assessment_id = ' + assessmentID + sWhere + ' return $elem' );
			firstLearning = ArrayOptFirstElem( learningArray );
			if ( firstLearning != undefined )
				return firstLearning.id;
		}
	}
	catch ( err )
	{
	}

	if ( bObjectParam )
	{
		if ( ! bSkipDismissedParam )
			personDoc = oPersonID.GetOptProperty( 'teCollaborator', OpenDoc( UrlFromDocID( personID ) ).TopElem );

		eventDoc = eventID == null ? null : oPersonID.GetOptProperty( 'teEvent', OpenDoc( UrlFromDocID( eventID ) ).TopElem );
		assessmentDoc = oPersonID.GetOptProperty( 'teAssessment', OpenDoc( UrlFromDocID( assessmentID ) ).TopElem );
		duration = OptInt( oPersonID.GetOptProperty( 'iDuration' ), null );
		try
		{
			start_learning_date = Date( oPersonID.GetOptProperty( 'dtStartLearningDate' ) );
		}
		catch( err )
		{
			start_learning_date = null;
		}
		educationPlanID = OptInt( oPersonID.GetOptProperty( 'iEducationPlanID' ), null );
		groupID = OptInt( oPersonID.GetOptProperty( 'iGroupID' ), null );
		bSkipDismissed = oPersonID.GetOptProperty( 'bCommenting' ) == true;
		bSelfEnrolled = oPersonID.GetOptProperty( 'bSelfEnrolled' ) == true;
	}
	else
	{
		if ( ! bSkipDismissedParam )
		{
			try
			{
				if ( _person_doc == null || _person_doc == '' || _person_doc == undefined )
					throw 'no_doc';

				personDoc = _person_doc;
			}
			catch ( err )
			{
				personDoc = OpenDoc( UrlFromDocID( personID ) ).TopElem;
			}
		}

		try
		{
			eventDoc = OpenDoc( UrlFromDocID( eventID ) ).TopElem;
		}
		catch ( err )
		{
			eventID = null;
			eventDoc = null;
		}
		try
		{
			if ( _test_doc == null || _test_doc == '' )
				throw 'no_doc';

			assessmentDoc = _test_doc;
		}
		catch ( err )
		{
			assessmentDoc = OpenDoc( UrlFromDocID( assessmentID ) ).TopElem;
		}
		try
		{
			duration = Int( _duration );
		}
		catch( err )
		{
			duration = null;
		}
		try
		{
			start_learning_date = Date( _start_learning_date );
		}
		catch( err )
		{
			start_learning_date = null;
		}
		try
		{
			groupID = Int( _group_id );
		}
		catch ( err )
		{
			groupID = null;
		}
		try
		{
			educationPlanID = Int( _education_plan_id );
		}
		catch ( err )
		{
			educationPlanID = null;
		}
		bSelfEnrolled = false;
	}

	docLearning = OpenNewDoc( 'x-local://wtv/wtv_active_test_learning.xmd' );
	learningDoc = docLearning.TopElem;
	learningDoc.person_id = personID;
	learningDoc.assessment_id = assessmentID;
	tools.common_filling( 'collaborator', learningDoc, personID, personDoc );
	tools.common_filling( 'assessment', learningDoc, assessmentID, assessmentDoc );
	learningDoc.use_proctoring = assessmentDoc.use_proctoring;
	learningDoc.is_self_enrolled = bSelfEnrolled;
//			learningDoc.scales.AssignElem( assessmentDoc.scales );

	if ( groupID != null )
	{
		learningDoc.group_id = groupID;
	}

	if ( educationPlanID != null )
	{
		learningDoc.education_plan_id = educationPlanID;
	}

	if ( eventID != null )
	{
		learningDoc.event_id = eventID;
		tools.common_filling( 'event', learningDoc, eventID, eventDoc );
	}

	if ( duration == 0 )
		learningDoc.duration.Clear();
	else if ( duration != null )
		learningDoc.duration = duration;

	if ( start_learning_date != null )
		learningDoc.start_learning_date = start_learning_date;

	learningDoc.max_end_date = learningDoc.calc_max_end_date;
	docLearning.BindToDb( DefaultDb );
	docLearning.Save();

	/*if ( ! assessmentDoc.not_use_default_notification )
	{
		tools.create_notification( '31', docLearning.DocID );
		tools.create_notification( '33', docLearning.DocID );
	}*/

	ms_tools.raise_system_event( 'common_activate_test', null, docLearning.DocID, docLearning );
	return docLearning;
}



function activate_course_to_person (oPersonID,_course_id,_event_id,_person_doc,_education_plan_id,_duration,_start_learning_date,dtLastLearningDateParam,_group_id,sEIDParam,bSkipDismissedParam) {
	personID = OptInt( oPersonID );
	bObjectParam = personID == undefined;
	if ( bObjectParam )
	{
		personID = Int( oPersonID.iPersonID );
		courseID = Int( oPersonID.iCourseID );
		sEIDParam = oPersonID.GetOptProperty( 'sEID', null );
		if ( sEIDParam == '' || sEIDParam == undefined )
			sEID = null;
		dtLastLearningDateParam = oPersonID.GetOptProperty( 'dtLastLearningDate', '' );
		bSkipDismissedParam = oPersonID.GetOptProperty( 'bSkipDismissed' ) == true;
		if ( bSkipDismissedParam )
			personDoc = oPersonID.GetOptProperty( 'teCollaborator', OpenDoc( UrlFromDocID( personID ) ).TopElem );
	}
	else
	{
		courseID = Int( _course_id );
		try
		{
			if ( sEIDParam == '' || sEIDParam == undefined )
				throw 'no_param';
		}
		catch ( err )
		{
			sEIDParam = null;
		}
		try
		{
			bSkipDismissedParam = bSkipDismissedParam == true;
		}
		catch ( err )
		{
			bSkipDismissedParam = false;
		}
		if ( bSkipDismissedParam )
		{
			try
			{
				if ( _person_doc == null || _person_doc == '' || _person_doc == undefined )
					throw 'no_doc';

				personDoc = _person_doc;
			}
			catch ( err )
			{
				personDoc = OpenDoc( UrlFromDocID( personID ) ).TopElem;
			}
		}
	}

	if ( bSkipDismissedParam && personDoc.is_dismiss )
		return null;

	activeLearningArray = XQuery( 'for $elem in active_learnings where $elem/person_id = ' + personID + ' and $elem/course_id = ' + courseID + ( sEIDParam == null ? '' : ' and $elem/code = ' + XQueryLiteral( sEIDParam ) ) + ' return $elem' );
	firstActiveLearning = ArrayOptFirstElem( activeLearningArray );
	if ( firstActiveLearning != undefined )
		return firstActiveLearning.id;

	try
	{
		if ( dtLastLearningDateParam != '' )
		{
			sWhere = dtLastLearningDateParam == null ? '' : ' and $elem/last_usage_date &gt; date(\'' + dtLastLearningDateParam + '\')';
			learningArray = XQuery( 'for $elem in learnings where $elem/person_id = ' + personID + ' and $elem/course_id = ' + courseID + sWhere + ' return $elem' );
			firstLearning = ArrayOptFirstElem( learningArray );
			if ( firstLearning != undefined )
				return firstLearning.id;
		}
	}
	catch ( err )
	{
	}

	if ( bObjectParam )
	{
		if ( ! bSkipDismissedParam )
			personDoc = oPersonID.GetOptProperty( 'teCollaborator', OpenDoc( UrlFromDocID( personID ) ).TopElem );

		eventID = OptInt( oPersonID.GetOptProperty( 'iEventID' ), null );
		eventDoc = eventID == null ? null : oPersonID.GetOptProperty( 'teEvent', OpenDoc( UrlFromDocID( eventID ) ).TopElem );
		courseDoc = oPersonID.GetOptProperty( 'teCourse', OpenDoc( UrlFromDocID( courseID ) ).TopElem );
		duration = OptInt( oPersonID.GetOptProperty( 'iDuration' ), null );
		try
		{
			start_learning_date = Date( oPersonID.GetOptProperty( 'dtStartLearningDate' ) );
		}
		catch( err )
		{
			start_learning_date = null;
		}
		educationPlanID = OptInt( oPersonID.GetOptProperty( 'iEducationPlanID' ), null );
		groupID = OptInt( oPersonID.GetOptProperty( 'iGroupID' ), null );
		bCommenting = oPersonID.GetOptProperty( 'bCommenting' ) == true;
		bLogging = oPersonID.GetOptProperty( 'bLogging' ) == true;
	}
	else
	{
		if ( ! bSkipDismissedParam )
		{
			try
			{
				if ( _person_doc == null || _person_doc == '' || _person_doc == undefined )
					throw 'no_doc';

				personDoc = _person_doc;
			}
			catch ( err )
			{
				personDoc = OpenDoc( UrlFromDocID( personID ) ).TopElem;
			}
		}

		try
		{
			eventID = Int( _event_id );
			try
			{
				if ( _event_doc == null || _event_doc == '' )
					throw 'no_doc';

				eventDoc = _event_doc;
			}
			catch ( err )
			{
				eventDoc = OpenDoc( UrlFromDocID( eventID ) ).TopElem;
			}
		}
		catch ( err )
		{
			eventID = null;
			eventDoc = null;
		}
		try
		{
			duration = Int( _duration );
		}
		catch( err )
		{
			duration = null;
		}
		try
		{
			start_learning_date = Date( _start_learning_date );
		}
		catch( err )
		{
			start_learning_date = null;
		}
		try
		{
			educationPlanID = Int( _education_plan_id );
		}
		catch ( err )
		{
			educationPlanID = null;
		}
		try
		{
			groupID = Int( _group_id );
		}
		catch ( err )
		{
			groupID = null;
		}
		courseDoc = OpenDoc( UrlFromDocID( courseID ) ).TopElem;
		bCommenting = false;
		bLogging = false;
	}

	docLearning = OpenNewDoc( 'x-local://wtv/wtv_active_learning.xmd' );
	learningDoc = docLearning.TopElem;
	learningDoc.person_id = personID;
	learningDoc.course_id = courseID;
	learningDoc.education_plan_id = educationPlanID;

	if ( courseDoc.struct_type == 'adaptive' && courseDoc.library_url.HasValue )
	{
		oParams = ({
			'teCourse': courseDoc,
			'teActiveLearning': learningDoc
		});
		oRes = CallObjectMethod( OpenCodeLib( courseDoc.library_url ), 'GetCourseParts', [ oParams ] );
		learningDoc.parts.AssignElem( oRes.parts );
	}
	else
	{
		learningDoc.parts.AssignElem( courseDoc.parts );
		for ( fldPartElem in learningDoc.parts )
		{
			fldPartChild = courseDoc.parts.GetChildByKey( fldPartElem.PrimaryKey );
			sStudentData = '';
			sStudentData += fldPartChild.max_time_allowed.HasValue ? 'max_time_allowed=' + fldPartChild.max_time_allowed + '\r\n' : '';
			sStudentData += fldPartChild.time_limit_action.HasValue ? 'time_limit_action=' + fldPartChild.time_limit_action + '\r\n' : '';
			sStudentData += fldPartChild.mastery_score.HasValue ? 'mastery_score=' + fldPartChild.mastery_score + '\r\n' : '';
			if ( sStudentData != '' )
				fldPartElem.data_lesson.student_data = '[STUDENT_DATA]\r\n' + sStudentData;
			if ( fldPartElem.assessment_id.HasValue )
			{
				tools.common_filling( 'assessment', fldPartElem, fldPartElem.assessment_id );
				if ( fldPartChild.attempts_num.HasValue )
					fldPartElem.attempts_num = fldPartChild.attempts_num;
			}
		}
	}

	tools.common_filling( 'course', learningDoc, courseID, courseDoc );
	tools.common_filling( 'collaborator', learningDoc, personID, personDoc );

	if ( eventID != null )
	{
		learningDoc.event_id = eventID;
		tools.common_filling( 'event', learningDoc, eventID, eventDoc );
	}


	if ( groupID != null )
	{
		learningDoc.group_id = groupID
	}

	if ( duration == 0 )
		learningDoc.duration.Clear();
	else if ( duration != null )
		learningDoc.duration = duration;

	if ( start_learning_date != null )
		learningDoc.start_learning_date = start_learning_date;

	learningDoc.base_url = courseDoc.base_url;
	learningDoc.score_sum_eval = courseDoc.score_sum_eval;
	learningDoc.max_end_date = learningDoc.calc_max_end_date;
	learningDoc.commenting = bCommenting;
	learningDoc.logging = bLogging;
	docLearning.BindToDb( DefaultDb );
	docLearning.Save();

	if ( courseDoc.price.HasValue && personDoc.org_id.HasValue )
		tools.pay_courses( personDoc.org_id, courseDoc.price, '' );

	/*if ( ! courseDoc.not_use_default_notification )
	{
		tools.create_notification( '30', docLearning.DocID );
		tools.create_notification( '32', docLearning.DocID );
	}*/
	ms_tools.raise_system_event( 'common_activate_course', null, docLearning.DocID, docLearning );

	return docLearning;
}
