function activateAssessmentWithSettings(collaboratorId, learningId, isRequirePassing, passingPeriod, settingsDate) {
	//alert("=========0000000========");
	//var MyTools = OpenCodeLib('x-local://wt/web/vsk/portal/boss-panel/server/utils/mytools.js');
	//DropFormsCache('x-local://wt/web/vsk/portal/boss-panel/server/utils/mytools.js');

	var doc = null;

	//alert("======11111========");
	try {
		if (String(passingPeriod) == '1') {
			var diffDateSeconds = null;
			var diffDays = null;

			try {
				diffDateSeconds = DateDiff(Date(settingsDate), Date());
			} catch(e) {}
			
			if (diffDateSeconds != null) {
				diffDays = diffDateSeconds / (60 * 60 * 24);
			}

			if (diffDays != null) {
				//alert("======1234=========");
				//убираем флаг, чтобы не отправлялись уведомления
				var aDoc = OpenDoc(UrlFromDocID(Int(learningId)));
				aDoc.TopElem.not_use_default_notification = true;
				aDoc.Save();

				doc = tools.activate_test_to_person(collaboratorId, learningId); //tools.activate_test_to_person(cl.id, at.id);

				aDoc.TopElem.not_use_default_notification = false;
				aDoc.Save();
				//alert("======1235=========");
				try {
					doc.TopElem
				} catch (e) {
					doc = OpenDoc(UrlFromDocID(Int(doc)));
				}

				doc.TopElem.duration = (diffDays + 1);
				doc.TopElem.max_end_date = Date(settingsDate);
			}
		} else {
			var aDoc = OpenDoc(UrlFromDocID(Int(learningId)));
			aDoc.TopElem.not_use_default_notification = true;
			aDoc.Save();

			
			doc = tools.activate_test_to_person(collaboratorId, learningId);
			var weeksSeconds = 3 * 7 * 24 * 60 * 60;
			var weeksDays = 3 * 7;
			doc.TopElem.max_end_date = DateOffset(DateNewTime(Date()), weeksSeconds);
			doc.TopElem.duration = weeksDays;

			aDoc.TopElem.not_use_default_notification = false;
			aDoc.Save();
		}
		
		if (doc != null) {
			try {
				doc.TopElem
			} catch (e) {
				doc = OpenDoc(UrlFromDocID(Int(doc)));
			}

			doc.TopElem.custom_elems.ObtainChildByKey('passing_require').value = isRequirePassing;
			doc.Save();

			tools.create_notification('31', doc.DocID);
			tools.create_notification('33', doc.DocID);
		} else {
			throw 'Ошибка при создании документа';
		}

	} catch(e) {
		throw 'Ошибка при назначении! \r\nТест "' + learningId + '", сотрудник "' + collaboratorId + '" : \r\n' + e + '\r\n';
	}
}

function activateCourseWithSettings(collaboratorId, learningId, isRequirePassing, passingPeriod, settingsDate) {
	//var MyTools = OpenCodeLib('x-local://wt/web/vsk/portal/boss-panel/server/utils/mytools.js');
	//DropFormsCache('x-local://wt/web/vsk/portal/boss-panel/server/utils/mytools.js');

	var doc = null;

	try {
		if (String(passingPeriod) == '1') {
			var diffDateSeconds = null;
			var diffDays = null;

			try {
				diffDateSeconds = DateDiff(Date(settingsDate), Date());
			} catch(e) {}
			
			if (diffDateSeconds != null) {
				diffDays = diffDateSeconds / (60 * 60 * 24);
			}

			if (diffDays != null) {

				var aDoc = OpenDoc(UrlFromDocID(Int(learningId)));
				aDoc.TopElem.not_use_default_notification = true;
				aDoc.Save();

				doc = tools.activate_course_to_person(collaboratorId, learningId);

				aDoc.TopElem.not_use_default_notification = false;
				aDoc.Save();

				try {
					doc.TopElem
				} catch (e) {
					doc = OpenDoc(UrlFromDocID(Int(doc)));
				}

				doc.TopElem.duration = (diffDays + 1);
				doc.TopElem.max_end_date = Date(settingsDate);
			}
		} else {
			var aDoc = OpenDoc(UrlFromDocID(Int(learningId)));
			aDoc.TopElem.not_use_default_notification = true;
			aDoc.Save();

			doc = tools.activate_course_to_person(collaboratorId, learningId);
			var weeksSeconds = 3 * 7 * 24 * 60 * 60;
			var weeksDays = 3 * 7;
			doc.TopElem.max_end_date = DateOffset(DateNewTime(Date()), weeksSeconds);
			doc.TopElem.duration = weeksDays;

			aDoc.TopElem.not_use_default_notification = false;
			aDoc.Save();
		}
		
		if (doc != null) {
			try {
				doc.TopElem
			} catch (e) {
				doc = OpenDoc(UrlFromDocID(Int(doc)));
			}

			doc.TopElem.custom_elems.ObtainChildByKey('passing_require').value = isRequirePassing;
			doc.Save();

			tools.create_notification('30', doc.DocID);
			tools.create_notification('32', doc.DocID);
		} else {
			throw 'Ошибка при создании документа';
		}

	} catch(e) {
		throw 'Ошибка при назначении! \r\nТест "' + learningId + '", сотрудник "' + collaboratorId + '" : \r\n' + e + '\r\n';
	}
}


function activateCoursesByFile(excelFileUrl, isRequirePassing, passingPeriod, settingsDate) {

	var error = '';

	function setError(str, strNumber){
		error = error + ' \r\n' + str + ' Номер строки: ' + strNumber;
	}


	var oExcelDoc = null;
	var ws = null;
	try {
		oExcelDoc = new ActiveXObject('Websoft.Office.Excel.Document');
		oExcelDoc.Open(excelFileUrl);
		ws = oExcelDoc.GetWorksheet(0);
	} catch(e) {
		return e;
	}
	

	var arr = [];
	var index = 0;
	var i = 2;

	var curValue = ws.Cells.GetCell('A1').Value;

	while(true) {
		if ((i % 999) == 0) {
			index = index + 1;
		}

		curValue = ws.Cells.GetCell('A' + i).Value;
		if (curValue == undefined || Trim(curValue) == '') {
			break;
		}

		code = curValue;
		assessmentCode = ws.Cells.GetCell('B' + i).Value;

		try {
			arr[index];
		} catch(e) {
			arr[index] = [];
		}		

		if (code != ''){
			arr[index].push('(\'' + code + '\', \'' + assessmentCode + '\', ' + i + ' )');
		} else {
			setError('Нет ключевого поля.', i);
		}

		i = i + 1;
	}


	var count = 0;
	for (i = 0; i < arr.length; i++) {
		darr = arr[i];

		strq = " \n\
			declare @source table ( \n\
				source_type varchar(100) not null, \n\
				course_code varchar(100) not null, \n\
				excel_line_number int not null \n\
			) \n\
			\n\
			insert into @source (source_type, course_code, excel_line_number) \n\
			values " + darr.join(',') + " \n\
			\n\
			select \n\
				st.source_type, \n\
				isnull(cs1.id, null) collaborator_id, \n\
				st.course_code, \n\
				crs.id as course_id, \n\
				st.excel_line_number, \n\
				ROW_NUMBER() OVER (PARTITION BY st.source_type ORDER BY st.source_type) AS row_number \n\
			from @source st \n\
			left join collaborators cs1 on cs1.code = st.source_type \n\
			left join courses crs on crs.code = st.course_code";

		q = XQuery("sql: " + strq);

		for (el in q){
			if (el.collaborator_id == null) {
				setError('Сотрудник с логином \'' + String(el.source_type) + '\' не найден.', String(el.excel_line_number));
				continue;
			}

			if (el.course_id == null) {
				setError('Курс \'' + String(el.course_code) + '\' не найден.', String(el.excel_line_number));
				continue;
			}

			
			try {
				//doc = tools.activate_course_to_person(el.collaborator_id, el.course_id);
				activateCourseWithSettings(el.collaborator_id, el.course_id, isRequirePassing, passingPeriod, settingsDate);
				count = count + 1;
			} catch(e){
				setError(e, String(el.excel_line_number));
			}
		}
		
	}

	return {
		error: error,
		count: count
	}
}

function activateAssessmentsByFile(excelFileUrl, isRequirePassing, passingPeriod, settingsDate){

	var error = '';

	function setError(str, strNumber){
		error = error + ' \r\n' + str + ' Номер строки: ' + strNumber;
	}


	var oExcelDoc = null;
	var ws = null;
	try {
		oExcelDoc = new ActiveXObject('Websoft.Office.Excel.Document');
		oExcelDoc.Open(excelFileUrl);
		ws = oExcelDoc.GetWorksheet(0);
	} catch(e) {
		return e;
	}
	

	var arr = [];
	var index = 0;
	var i = 2;

	var curValue = ws.Cells.GetCell('A1').Value;

	while(true) {
		if ((i % 999) == 0) {
			index = index + 1;
		}

		curValue = ws.Cells.GetCell('A' + i).Value;
		if (curValue == undefined || Trim(curValue) == '') {
			break;
		}

		code = curValue;
		assessmentCode = ws.Cells.GetCell('B' + i).Value;

		try {
			arr[index];
		} catch(e) {
			arr[index] = [];
		}		

		if (code != ''){
			arr[index].push('(\'' + code + '\', \'' + assessmentCode + '\', ' + i + ' )');
		} else {
			setError('Нет ключевого поля.', i);
		}

		i = i + 1;
	}

	var count = 0;
	for (i = 0; i < arr.length; i++) {
		darr = arr[i];

		strq = " \n\
			declare @source table ( \n\
				source_type varchar(100) not null, \n\
				assessment_code varchar(100) not null, \n\
				excel_line_number int not null \n\
			) \n\
			\n\
			insert into @source (source_type, assessment_code, excel_line_number) \n\
			values " + darr.join(',') + " \n\
			\n\
			select \n\
				st.source_type, \n\
				isnull(cs1.id, null) collaborator_id, \n\
				st.assessment_code, \n\
				crs.id as assessment_id, \n\
				st.excel_line_number, \n\
				ROW_NUMBER() OVER (PARTITION BY st.source_type ORDER BY st.source_type) AS row_number \n\
			from @source st \n\
			left join collaborators cs1 on cs1.code = st.source_type \n\
			left join assessments crs on crs.code = st.assessment_code";

		q = XQuery("sql: " + strq);
		//alert(strq);

		for (el in q){
			if (el.collaborator_id == null) {
				setError('Сотрудник с логином \'' + String(el.source_type) + '\' не найден.', String(el.excel_line_number));
				continue;
			}

			if (el.assessment_id == null) {
				setError('Курс \'' + String(el.course_code) + '\' не найден.', String(el.excel_line_number));
				continue;
			}
			
			try {
				activateAssessmentWithSettings(el.collaborator_id, el.assessment_id, isRequirePassing, passingPeriod, settingsDate);
				//doc = tools.activate_test_to_person(el.collaborator_id, el.assessment_id);
				count = count + 1;
			} catch(e){
				setError(e, String(el.excel_line_number));
			}
		}
	}

	return {
		error: error,
		count: count
	}
}