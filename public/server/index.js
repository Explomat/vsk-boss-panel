<%
	//curUserID = 6605153029051275340; //Zayats
	//curUserID = 6605155987556877175; // Анапольский
	//curUserID = 6719946806941395578; //Асафов тест
	//curUserID = 6605156452417082406; // Асафов 
	//curUserID = 6711785032659205612; //Me test

	//curUserID = 6605155785782208336; //Пудан

	//curUserID = 6605154398863757020; // my test

	var _LearningsRequests = OpenCodeLib('x-local://wt/web/vsk/portal/boss-panel/server/utils/learningsRequests.js');
	DropFormsCache('x-local://wt/web/vsk/portal/boss-panel/server/utils/learningsRequests.js');

	var _Utils = OpenCodeLib('x-local://wt/web/vsk/portal/boss-panel/server/utils/utils.js');
	DropFormsCache('x-local://wt/web/vsk/portal/boss-panel/server/utils/utils.js');

	var _ActivateLearnings = OpenCodeLib('x-local://wt/web/vsk/portal/boss-panel/server/utils/activateLearnings.js');
	DropFormsCache('x-local://wt/web/vsk/portal/boss-panel/server/utils/activateLearnings.js');

	var Report = OpenCodeLib('x-local://wt/web/vsk/portal/boss-panel/server/utils/report.js');
	DropFormsCache('x-local://wt/web/vsk/portal/boss-panel/server/utils/report.js');

	function getUser(userId) {
		var us = ArrayOptFirstElem(XQuery("sql: \n\
			select \n\
				distinct(cs.id) id, \n\
				cs.role_id, \n\
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

		var userObj = undefined;
		if (us != undefined) {
			userObj = {
				id: Int(us.id),
				role_id: String(us.role_id),
				code: String(us.code),
				fullname: String(us.fullname),
				position_name: String(us.position_name),
				position_parent_name: String(us.position_parent_name),
				position_parent_id: Int(us.position_parent_id),
				is_admin: (String(us.role_id) == 'admin' ? true: false)
			}

			return userObj;
		}

		return userObj;
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

				try {
					_ActivateLearnings.activateCourseWithSettings(cl.id, cr.id, isRequirePassing, passingPeriod, settingsDate);
				} catch(e) {
					errors = errors + e;
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

				try {
					//alert('=====123=======');
					_ActivateLearnings.activateAssessmentWithSettings(cl.id, at.id, isRequirePassing, passingPeriod, settingsDate);
				} catch(e) {
					errors = errors + e;
				}
			}
		}
		return _Utils.setSuccess(null, errors);
	}

	function get_LearningsReport() {
		var u = getUser(curUserID);
		if (u == undefined) {
			return _Utils.setError('Пользователь не найден или не является руководителем');
		}

		var ls = _LearningsRequests.getLearnings(Int(u.position_parent_id));
		var excelPath = '';

		try {
			excelPath = Report.create(ls);
		} catch(e) {
			alert('e: ' + e);
			return _Utils.setError(e);
		}
		
		Request.AddRespHeader('Content-Type', 'application/octet-stream');
		Request.AddRespHeader('Content-disposition', 'attachment; filename=report.xlsx');
		return LoadFileData(excelPath);
	}

	function get_TestLearningsReport() {
		var u = getUser(curUserID);
		if (u == undefined) {
			return _Utils.setError('Пользователь не найден или не является руководителем');
		}

		var tls = _LearningsRequests.getTestLearnings(Int(u.position_parent_id));
		var excelPath = '';

		try {
			excelPath = Report.create(tls);
		} catch(e) {
			alert('e: ' + e);
			return _Utils.setError(e);
		}
		
		Request.AddRespHeader('Content-Type', 'application/octet-stream');
		Request.AddRespHeader('Content-disposition', 'attachment; filename=report.xlsx');
		return LoadFileData(excelPath);
	}

	function post_UploadCoursesFile(queryObjects) {
		var formData = queryObjects.Request.Form;
		var file = formData.file;

		var tempFilePath = UserDataDirectoryPath() + '\\datex_user_temp\\' + curUserID;
		var filePath = '';

		try {
			ObtainDirectory(tempFilePath, true);
			filePath = tempFilePath + '\\' + DateToRawSeconds(Date()) + '.xls';
			PutFileData(filePath, file);
			Request.Session.boss_panel = {};
			Request.Session.boss_panel.file_upload_path = filePath;

			var info = _ActivateLearnings.getCoursesInfoByFile(filePath);
			return _Utils.setSuccess(info);
		} catch(e) {
			return _Utils.setError(e);
		}
	}

	function post_UploadAssementsFile(queryObjects) {
		var formData = queryObjects.Request.Form;
		var file = formData.file;

		var tempFilePath = UserDataDirectoryPath() + '\\datex_user_temp\\' + curUserID;
		var filePath = '';

		try {
			ObtainDirectory(tempFilePath, true);
			filePath = tempFilePath + '\\' + DateToRawSeconds(Date()) + '.xls';
			PutFileData(filePath, file);
			Request.Session.boss_panel = {};
			Request.Session.boss_panel.file_upload_path = filePath;
			//alert(tools.object_to_text(Request.Session, 'json'));

			var info = _ActivateLearnings.getAssessmentsInfoByFile(filePath);
			return _Utils.setSuccess(info);
		} catch(e) {
			return _Utils.setError(e);
		}
	}

	function post_ActivateCoursesByFile(queryObjects) {
		var filePath = null;
		var mode = Request.Session.GetOptProperty('boss_panel');
		if (mode != undefined) {
			filePath = mode.GetOptProperty('file_upload_path');
		}

		if (filePath != undefined && filePath != null) {
			var data = tools.read_object(queryObjects.Body);
			var isRequirePassing = data.HasProperty('is_require_settings_passing') ? data.is_require_settings_passing : false;
			var passingPeriod = data.HasProperty('selected_settings_passing_period') ? data.selected_settings_passing_period : 2;
			var settingsDate = data.HasProperty('settings_date') ? data.settings_date : null;

			var rObj = _ActivateLearnings.activateCoursesByFile(filePath, isRequirePassing, passingPeriod, settingsDate);
			return _Utils.setSuccess(rObj);
		}

		return _Utils.setError('Неизвестная ошибка');
	}

	function post_ActivateAssementsByFile(queryObjects) {
		var filePath = null;
		var mode = Request.Session.GetOptProperty('boss_panel');
		if (mode != undefined) {
			filePath = mode.GetOptProperty('file_upload_path');
		}

		if (filePath != undefined && filePath != null) {
			var data = tools.read_object(queryObjects.Body);
			var isRequirePassing = data.HasProperty('is_require_settings_passing') ? data.is_require_settings_passing : false;
			var passingPeriod = data.HasProperty('selected_settings_passing_period') ? data.selected_settings_passing_period : 2;
			var settingsDate = data.HasProperty('settings_date') ? data.settings_date : null;

			var rObj = _ActivateLearnings.activateAssessmentsByFile(filePath, isRequirePassing, passingPeriod, settingsDate);
			return _Utils.setSuccess(rObj);
		}

		/*var data = tools.read_object(queryObjects.Body);
		var isRequirePassing = data.HasProperty('is_require_settings_passing') ? data.is_require_settings_passing : false;
		var passingPeriod = data.HasProperty('selected_settings_passing_period') ? data.selected_settings_passing_period : 2;
		var settingsDate = data.HasProperty('settings_date') ? data.settings_date : null;

		var rObj = _ActivateLearnings.activateAssessmentsByFile('E:\\WebSoft\\WebTutorServer\\datex_user_temp\\6719946806941395578\\1583922249.xls', isRequirePassing, passingPeriod, settingsDate);
		return _Utils.setSuccess(rObj);*/

		return _Utils.setError('Неизвестная ошибка');
	}
%>