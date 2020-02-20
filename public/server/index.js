<%
	//curUserID = 6605153029051275340; //Zayats
	//curUserID = 6605155987556877175; // Анапольский
	//curUserID = 6719946806941395578; //Асафов тест
	//curUserID = 6605156452417082406; // Асафов 
	//curUserID = 6711785032659205612; //Me test

	//curUserID = 6605155785782208336; //Пудан

	//curUserID = 6605154398863757020; // my test

	var _Learnings = OpenCodeLib('x-local://wt/web/vsk/portal/boss-panel/server/utils/learnings.js');
	DropFormsCache('x-local://wt/web/vsk/portal/boss-panel/server/utils/learnings.js');

	var _Utils = OpenCodeLib('x-local://wt/web/vsk/portal/boss-panel/server/utils/utils.js');
	DropFormsCache('x-local://wt/web/vsk/portal/boss-panel/server/utils/utils.js');

	function getUser(userId) {
		return ArrayOptFirstElem(XQuery("sql: \n\
			select \n\
				distinct(cs.id), \n\
				cs.code, \n\ 
				cs.fullname, \n\
				cs.position_name, \n\
				cs.position_parent_name, \n\
				cs.position_parent_id \n\
			from collaborators cs \n\
			inner join func_managers fm on fm.person_id = cs.id \n\
			inner join boss_types bt on bt.id = fm.boss_type_id  \n\
			where \n\
				cs.id = " + userId + " \n\
				and cs.is_dismiss = 0 \n\
				and bt.code = 'main' \n\
		"));
	}

	function getAllSubordinates(userId, subId){
		return XQuery("sql: \n\
			select \n\
				cs.id, \n\
				cs.fullname \n\
			from collaborators cs \n\
			inner join collaborator c on c.id = cs.id \n\
			cross apply c.data.nodes('/collaborator/path_subs') as t(p) \n\
			where \n\
				(t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				and cs.is_dismiss = 0 \n\
				and cs.id <> " + userId + " \n\
		");
	}

	function get_User(){
		var q = getUser(curUserID);
		return _Utils.setSuccess(q);
	}

	function get_Subordinates(queryObjects) {
		var search = queryObjects.HasProperty('search') ? queryObjects.search : '';
		var subId = queryObjects.HasProperty('sub_id') ? OptInt(queryObjects.sub_id) : 0;
		var page = queryObjects.HasProperty('page') ? OptInt(queryObjects.page) : 1;
		var pageSize = queryObjects.HasProperty('page_size') ? OptInt(queryObjects.page_size) : 10;

		if (subId == 0 || subId == undefined) {
			return _Utils.setError('Не указано подразделение');
		}

		var min = (page - 1) * pageSize;
		var max = min + pageSize;
		
		var q = XQuery("sql: \n\
			declare @s varchar(max) = '" + search + "'; \n\
			select d.* \n\
			from ( \n\
				select \n\
					count(cs.id) over() total, \n\
					ROW_NUMBER() OVER (ORDER BY cs.fullname) AS [row_number], \n\
					cs.id, \n\
					cs.fullname, \n\
					cs.position_name, \n\
					cs.code, \n\
					cs.hire_date, \n\
					cs.dismiss_date, \n\
					cs.pict_url, \n\
					cast(t.p.query(' \n\
					for $PD in  /collaborator/path_subs/path_sub \n\
						return concat(data($PD/name[1]), \" / \") \n\
					') as varchar(max)) as structure \n\
					--t.p.query('/collaborator/path_subs') as structure \n\
				from collaborators cs \n\
				inner join collaborator c on c.id = cs.id \n\
				cross apply c.data.nodes('/collaborator/path_subs') as t(p) \n\
				where \n\
				    (t.p.exist('path_sub/id[(. cast as xs:string?) = \"" + subId + "\"]') = 1) \n\
				    and cs.is_dismiss = 0 \n\
				    and cs.id <> " + curUserID + " \n\
				    and cs.fullname like '%'+@s+'%' \n\
			) d \n\
			where \n\
				d.[row_number] > " + min + " and d.[row_number] <= " + max + " \n\
			order by d.fullname asc \n\
		");

		var total = 0;
		var fobj = ArrayOptFirstElem(q);
		if (fobj != undefined) {
			total = fobj.total;
		}

		var obj = {
			meta: {
				total: Int(total),
				pageSize: pageSize
			},
			subordinates: q
		}

		/*var obj = {
			meta: {
				total: 30,
				pageSize: pageSize
			},
			subordinates: [
				{
					id: 1,
					fullname: 'test Test test',
					position_name: 'Developer',
					pict_url: 'dasd'
				},
				{
					id: 2,
					fullname: 'test1 Test1 test1',
					position_name: 'Developer1',
					pict_url: 'dasd1'
				}
			]
		}*/

		return _Utils.setSuccess(obj);
	}

	function get_Courses(queryObjects){
		var search = queryObjects.HasProperty('search') ? queryObjects.search : '';
		var page = queryObjects.HasProperty('page') ? OptInt(queryObjects.page) : 1;
		var pageSize = queryObjects.HasProperty('page_size') ? OptInt(queryObjects.page_size) : 10;


		var min = (page - 1) * pageSize;
		var max = min + pageSize;

		var q = XQuery("sql: \n\
			declare @s varchar(max) = '" + search + "'; \n\
			select \n\
				d.* \n\
			from ( \n\
				select \n\
					count(cs.id) over() total, \n\
					ROW_NUMBER() OVER (ORDER BY cs.name) AS [row_number], \n\
					cs.id, \n\
					cs.code, \n\
					cs.name title, \n\
					case cs.resource_id \n\
						when null then '' \n\
						else '/download_file.html?file_id=' + cast(cs.resource_id as varchar(30)) \n\
					end pict_url, \n\
					cs.status, \n\
					cs.max_score, \n\
					cs.yourself_start, \n\
					cs.duration \n\
				from courses cs \n\
				where \n\
					cs.name like '%'+@s+'%' \n\
					and cs.[status] <> 'secret' \n\
			) d \n\
			where \n\
				d.[row_number] > " + min + " and d.[row_number] <= " + max + " \n\
		");

		var total = 0;
		var fobj = ArrayOptFirstElem(q);
		if (fobj != undefined) {
			total = fobj.total;
		}

		var obj = {
			meta: {
				total: Int(total),
				pageSize: pageSize
			},
			learnings: q
		}

		return _Utils.setSuccess(obj);
	}

	function get_Assessments(queryObjects){
		var search = queryObjects.HasProperty('search') ? queryObjects.search : '';
		var page = queryObjects.HasProperty('page') ? OptInt(queryObjects.page) : 1;
		var pageSize = queryObjects.HasProperty('page_size') ? OptInt(queryObjects.page_size) : 10;

		var min = (page - 1) * pageSize;
		var max = min + pageSize;

		var q = XQuery("sql: \n\
			declare @s varchar(max) = '" + search + "'; \n\
			select \n\
				case d.resource_id \n\
					when null then '' \n\
					else '/download_file.html?file_id=' + cast(d.resource_id as varchar(30)) \n\
				end pict_url, \n\
				d.* \n\
			from ( \n\
				select \n\
					count(ats.id) over() total, \n\
					ROW_NUMBER() OVER (ORDER BY ats.title) AS [row_number], \n\
					ats.id, \n\
					ats.code, \n\
					ats.title, \n\
					ats.status, \n\
					ats.duration, \n\
					ats.passing_score, \n\
					R.cmp.query('resource_id').value('.', 'varchar(30)') resource_id \n\
				from assessments ats \n\
				inner join assessment as c_xml ON ats.id = c_xml.id \n\
				cross apply c_xml.data.nodes('/assessment') as R(cmp) \n\
				where \n\
					ats.title like '%'+@s+'%' \n\
					and ats.[status] <> 'secret' \n\
			) d \n\
			where \n\
				d.[row_number] > " + min + " and d.[row_number] <= " + max + " \n\
		");

		var total = 0;
		var fobj = ArrayOptFirstElem(q);
		if (fobj != undefined) {
			total = fobj.total;
		}

		var obj = {
			meta: {
				total: Int(total),
				pageSize: pageSize
			},
			learnings: q
		}

		return _Utils.setSuccess(obj);
	}

	function post_Courses(queryObjects){
		var data = tools.read_object(queryObjects.Body);
		var isAll = data.HasProperty('is_all') ? data.is_all : false;
		var cls = data.HasProperty('collaborators') ? data.collaborators : [];
		var crs = data.HasProperty('learnings') ? data.learnings : [];
		var isRequirePassing = data.HasProperty('is_require_settings_passing') ? data.is_require_settings_passing : false;
		var passingPeriod = data.HasProperty('selected_settings_passing_period') ? data.selected_settings_passing_period : 2;
		var settingsDate = data.HasProperty('settings_date') ? data.settings_date : null;

		if (crs.length == 0) {
			return _Utils.setError('Invalid parametres');
		}

		var errors = '';

		if (isAll) {
			cls = getAllSubordinates(curUserID, curUser.position_parent_id);
		}

		for (cr in crs) {
			for (cl in cls){
				doc = null;

				try {
					if (passingPeriod == 1) {
						diffDateSeconds = null;
						diffDays = null;

						try {
							diffDateSeconds = DateDiff(Date(settingsDate), Date());
						} catch(e) {}
						
						if (diffDateSeconds != null) {
							diffDays = diffDateSeconds / (60 * 60 * 24);
						}

						if (diffDays != null) {
							doc = tools.activate_course_to_person(cl.id, cr.id);

							try {
								doc.TopElem
							} catch (e) {
								doc = OpenDoc(UrlFromDocID(Int(doc)));
							}

							doc.TopElem.duration = (diffDays + 1);
							doc.TopElem.max_end_date = Date(settingsDate);
						}
					} else {
						doc = tools.activate_course_to_person(cl.id, cr.id);
					}
					
					if (doc != null) {
						try {
							doc.TopElem
						} catch (e) {
							doc = OpenDoc(UrlFromDocID(Int(doc)));
						}

						doc.TopElem.custom_elems.ObtainChildByKey('passing_require').value = isRequirePassing;
						doc.Save();
					} else {
						throw 'Ошибка при создании документа';
					}
					
				} catch(e) {
					errors = errors + 'Ошибка при назначении! \r\nКурс "' + String(cr.title) + '", сотрудник "' + cl.fullname + '" : \r\n' + e + '\r\n';
				}
			}
		}

		return _Utils.setSuccess(null, errors);
	}

	function post_Assessments(queryObjects){
		var data = tools.read_object(queryObjects.Body);
		var isAll = data.HasProperty('is_all') ? data.is_all : false;
		var cls = data.HasProperty('collaborators') ? data.collaborators : [];
		var ats = data.HasProperty('learnings') ? data.learnings : [];
		var isRequirePassing = data.HasProperty('is_require_settings_passing') ? data.is_require_settings_passing : false;
		var passingPeriod = data.HasProperty('selected_settings_passing_period') ? data.selected_settings_passing_period : 2;
		var settingsDate = data.HasProperty('settings_date') ? data.settings_date : null;

		if (ats.length == 0) {
			return _Utils.setError('Invalid parametres');
		}

		var errors = '';

		if (isAll) {
			cls = getAllSubordinates(curUserID, OpenDoc(UrlFromDocID(curUserID)).TopElem.position_parent_id);
		}

		for (at in ats) {
			for (cl in cls){
				doc = null;

				try {
					if (passingPeriod == 1) {
						diffDateSeconds = null;
						diffDays = null;

						try {
							diffDateSeconds = DateDiff(Date(settingsDate), Date());
						} catch(e) {}
						
						if (diffDateSeconds != null) {
							diffDays = diffDateSeconds / (60 * 60 * 24);
						}

						if (diffDays != null) {
							doc = tools.activate_test_to_person(cl.id, at.id, null, null, null, null, (diffDays + 1));
						}
					} else {
						doc = tools.activate_test_to_person(cl.id, at.id);
					}
					
					if (doc != null) {
						try {
							doc.TopElem
						} catch (e) {
							doc = OpenDoc(UrlFromDocID(Int(doc)));
						}

						doc.TopElem.custom_elems.ObtainChildByKey('passing_require').value = isRequirePassing;
						doc.Save();
					} else {
						throw 'Ошибка при создании документа';
					}

				} catch(e) {
					errors = errors + 'Ошибка при назначении! \r\nТест "' + String(at.title) + '", сотрудник "' + cl.fullname + '" : \r\n' + e + '\r\n';
				}
			}
		}
		return _Utils.setSuccess(null, errors);
	}

	function _report(learningItems){
		var colWidths = [];

		function columnNameByIndex (d){
			var colName = '';
			while (d > 0) {
				m = (d - 1) % 26;
				colName = String.fromCharCode(65 + m) + colName;
				d = Int((d - m) / 26)
			}
			return colName;
		}

		function setMaxColWith(value, index){
			var count = StrCharCount(value);
			var c = 0;
			try {
				c = colWidths[index];
			} catch(e) {}

			colWidths[index] = count > c ? count : c;
		}


		var path = UrlToFilePath(ObtainTempFile('.xlsx'));
		var oExcelDoc = new ActiveXObject('Websoft.Office.Excel.Document');
		oExcelDoc.CreateWorkBook();
		var oWorksheet = oExcelDoc.GetWorksheet(0);
		var	rindex = 1;

		oCell = oWorksheet.Cells.GetCell('A' + rindex);
		oCell.Value = 'ФИО';
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, 0);

		oCell = oWorksheet.Cells.GetCell('B' + rindex);
		oCell.Value = 'Поразделение';
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, 0);

		oCell = oWorksheet.Cells.GetCell('C' + rindex);
		oCell.Value = 'Структура';
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, 0);

		oCell = oWorksheet.Cells.GetCell('D' + rindex);
		oCell.Value = 'Должность';
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, 0);

		oCell = oWorksheet.Cells.GetCell('E' + rindex);
		oCell.Value = 'Название';
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, 0);

		oCell = oWorksheet.Cells.GetCell('F' + rindex);
		oCell.Value = 'Дата начала';
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, 0);

		oCell = oWorksheet.Cells.GetCell('G' + rindex);
		oCell.Value = 'Дата окончания';
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, 0);

		oCell = oWorksheet.Cells.GetCell('H' + rindex);
		oCell.Value = 'Процент выполнения';
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, 0);

		oCell = oWorksheet.Cells.GetCell('I' + rindex);
		oCell.Value = 'Статус';
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, 0);

		rindex = rindex + 1;

		for(el in learningItems){
			oCell = oWorksheet.Cells.GetCell('A' + rindex);
			oCell.Value = String(el.person_fullname);
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, 0); 

			oCell = oWorksheet.Cells.GetCell('B' + rindex);
			oCell.Value = String(el.person_subdivision_name);
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, 1);

			oCell = oWorksheet.Cells.GetCell('C' + rindex);
			oCell.Value = String(el.structure);
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, 2);

			oCell = oWorksheet.Cells.GetCell('D' + rindex);
			oCell.Value = String(el.person_position_name);
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, 3); 

			oCell = oWorksheet.Cells.GetCell('E' + rindex);
			oCell.Value = String(el.learning_name);
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, 4);

			oCell = oWorksheet.Cells.GetCell('F' + rindex);
			oCell.Value = String(el.start_usage_date);
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, 5);

			oCell = oWorksheet.Cells.GetCell('G' + rindex);
			oCell.Value = String(el.last_usage_date);
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, 6);

			oCell = oWorksheet.Cells.GetCell('H' + rindex);
			oCell.Value = String(el.percent_score);
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, 7);

			oCell = oWorksheet.Cells.GetCell('I' + rindex);
			oCell.Value = String(el.status);
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, 8);

			rindex = rindex + 1;
		}

		for (i = 0; i < colWidths.length; i++){
			oWorksheet.Cells.SetColumnWidth(i, colWidths[i]);
		}

		oWorksheet.Cells.SetRowHeight(2, 30.0);
		oExcelDoc.SaveAs(path);
		return path;
	}

	function get_LearningsReport() {
		var u = getUser(curUserID);
		if (u == undefined) {
			return _Utils.setError('Пользователь не найден или не является руководителем');
		}

		var ls = _Learnings.getLearnings(Int(u.position_parent_id));
		//alert('ArrayCount(ls): ' + ArrayCount(ls));
		var excelPath = '';

		try {
			excelPath = _report(ls);
			//alert('excelPath: ' + excelPath);
		} catch(e) {
			alert('e: ' + e);
			return _Utils.setError(e);
		}
		
		Request.AddRespHeader('Content-Type', 'application/octet-stream');
		Request.AddRespHeader('Content-disposition', 'attachment; filename=report.xlsx');
		//Response.Write(LoadFileData(path));
		return LoadFileData(excelPath);
	}

	function get_TestLearningsReport() {
		var u = getUser(curUserID);
		if (u == undefined) {
			return _Utils.setError('Пользователь не найден или не является руководителем');
		}

		var tls = _Learnings.getTestLearnings(Int(u.position_parent_id));
		var excelPath = '';

		try {
			excelPath = _report(tls);
		} catch(e) {
			alert('e: ' + e);
			return _Utils.setError(e);
		}
		
		Request.AddRespHeader('Content-Type', 'application/octet-stream');
		Request.AddRespHeader('Content-disposition', 'attachment; filename=report.xlsx');
		return LoadFileData(excelPath);
		//Response.Write(LoadFileData(path));
	}

	/*function get_Test() {
		Request.AddRespHeader('Content-Type', 'application/octet-stream');
		Request.AddRespHeader('Content-disposition', 'attachment; filename=report.xlsx');
		return LoadFileData('C:\\Windows\\Temp\\DatexTemp\\test.xlsx');
	}*/

%>