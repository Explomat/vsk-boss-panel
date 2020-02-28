function activateCourses(excelFileUrl) {

	alert('activateCourses -> excelFileUrl:' + excelFileUrl);

	var error = '';

	function setError(str, strNumber){
		error = error + ' \r\n' + str + ' Номер строки: ' + strNumber;
	}

	try {
		sourceList = OpenDoc(excelFileUrl, 'format=excel');
		lines = ArrayFirstElem(sourceList.TopElem);
	} catch(err) {
		alert("ОШИБКА: невозможно получить доступ к файлу " + excelFileUrl + ".");
		return;
	}


	var lcount = ArrayCount(lines);
	var arr = [];
	var index = 0;

	for (i = 1; i < lcount; i++) {
		if ((i % 999) == 0) {
			index = index + 1;
		}

		code = lines[i][1];
		courseCode = lines[i][2];

		try {
			arr[index];
		} catch(e) {
			arr[index] = [];
		}		

		if (code != ''){
			arr[index].push('(\'' + code + '\', \'' + courseCode + '\', ' + i + ' )');
		} else {
			setError('Нет ключевого поля.', i);
		}
	}
	
	//alert(tools.object_to_text(arr, 'json'));

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

			if (OptInt(el.row_number) > 1){
				setError('Обнаружен дубликат: ' + el.source_type + '.', String(el.excel_line_number));
			}
			
			try {
				doc = tools.activate_course_to_person(el.collaborator_id, el.course_id);
			} catch(e){
				setError(e, String(el.excel_line_number));
			}
		}
		
	}

	if (error != ''){
		return error;
	}	
}

function activateAssessments(excelFileUrl){
	alert('activateAssessments -> excelFileUrl:' + excelFileUrl);

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
		alert("ОШИБКА: невозможно получить доступ к файлу " + excelFileUrl + ".");
		alert(err);
	}
	

	alert('---------000-------');
	alert((ws == null));

	var lcount = ws.Cells.Rows.Count;
	var arr = [];
	var index = 0;

	alert('---------111-------');
	for (i = 1; i < lcount; i++) {
		if ((i % 999) == 0) {
			index = index + 1;
		}


		code = oExcelDoc.Cells.GetCell('A' + i).Value;
		alert('---------222-------');
		assessmentCode = oExcelDoc.Cells.GetCell('B' + i).Value;
		alert('---------333-------');

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
	}

	alert('---------444-------');

	/*try {
		sourceList = OpenDoc(excelFileUrl, 'format=excel');
		lines = ArrayFirstElem(sourceList.TopElem);
	} catch(err) {
		alert('33333333333333');
		alert("ОШИБКА: невозможно получить доступ к файлу " + excelFileUrl + ".");
		alert(err);
		return;
	}


	var lcount = ArrayCount(lines);
	var arr = [];
	var index = 0;

	for (i = 1; i < lcount; i++) {
		if ((i % 999) == 0) {
			index = index + 1;
		}

		code = lines[i][1];
		assessmentCode = lines[i][2];

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
	}*/
	
	//alert(tools.object_to_text(arr, 'json'));

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
		for (el in q){
			if (el.collaborator_id == null) {
				setError('Сотрудник с логином \'' + String(el.source_type) + '\' не найден.', String(el.excel_line_number));
				continue;
			}

			if (el.assessment_id == null) {
				setError('Курс \'' + String(el.course_code) + '\' не найден.', String(el.excel_line_number));
				continue;
			}

			if (OptInt(el.row_number) > 1){
				setError('Обнаружен дубликат: ' + el.source_type + '.', String(el.excel_line_number));
			}
			
			try {
				doc = tools.activate_course_to_person(el.collaborator_id, el.assessment_id);
			} catch(e){
				setError(e, String(el.excel_line_number));
			}
		}
	}

	if (error != ''){
		return error;
	}
}